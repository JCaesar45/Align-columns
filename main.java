import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

public class LuminaryServer {
    
    private static final int PORT = 9090;
    private static final Gson GSON = new Gson();
    private static final ConcurrentHashMap<String, SessionData> sessions = new ConcurrentHashMap<>();
    private static final ExecutorService threadPool = Executors.newVirtualThreadPerTaskExecutor();
    
    public record SessionData(
        String sessionId,
        Instant createdAt,
        int requestCount,
        String clientAddress
    ) {
        public SessionData incrementRequests() {
            return new SessionData(
                this.sessionId,
                this.createdAt,
                this.requestCount + 1,
                this.clientAddress
            );
        }
    }
    
    public sealed interface CommandResponse 
        permits SuccessResponse, ErrorResponse {
        String status();
    }
    
    public record SuccessResponse(String status, Map<String, Object> data) 
        implements CommandResponse {}
    
    public record ErrorResponse(String status, String message) 
        implements CommandResponse {}
    
    @FunctionalInterface
    interface CommandHandler {
        CommandResponse execute(String[] args, SessionData session);
    }
    
    private static final Map<String, CommandHandler> COMMANDS = Map.of(
        "hash", (args, session) -> {
            String input = args.length > 0 
                ? String.join(" ", args) 
                : UUID.randomUUID().toString();
            try {
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
                String hash = bytesToHex(digest);
                return new SuccessResponse("ok", Map.of(
                    "algorithm", "SHA-256",
                    "input", input,
                    "hash", hash
                ));
            } catch (Exception e) {
                return new ErrorResponse("error", e.getMessage());
            }
        },
        
        "timestamp", (args, session) -> {
            Instant now = Instant.now();
            return new SuccessResponse("ok", Map.of(
                "epoch", now.getEpochSecond(),
                "iso", now.toString(),
                "session_requests", session.requestCount()
            ));
        },
        
        "stats", (args, session) -> new SuccessResponse("ok", Map.of(
            "active_sessions", sessions.size(),
            "uptime_seconds", 
                (Instant.now().getEpochSecond() - ServerStartTime.get()),
            "java_version", System.getProperty("java.version")
        )),
        
        "uuid", (args, session) -> new SuccessResponse("ok", Map.of(
            "uuid", UUID.randomUUID().toString(),
            "variant", "Leach-Salz"
        ))
    );
    
    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
    
    static class ServerStartTime {
        private static final long START = Instant.now().getEpochSecond();
        static long get() { return START; }
    }
    
    static class ApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String clientIp = exchange.getRemoteAddress().getAddress().getHostAddress();
            String sessionId = exchange.getRequestHeaders()
                .getFirst("X-Session-Id");
            
            if (sessionId == null) {
                sessionId = UUID.randomUUID().toString();
            }
            
            SessionData session = sessions.compute(
                sessionId,
                (key, existing) -> existing == null 
                    ? new SessionData(key, Instant.now(), 1, clientIp)
                    : existing.incrementRequests()
            );
            
            exchange.getResponseHeaders().set("X-Session-Id", sessionId);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            
            if ("GET".equals(exchange.getRequestMethod())) {
                String path = exchange.getRequestURI().getPath();
                
                if ("/health".equals(path)) {
                    sendResponse(exchange, 200, new SuccessResponse("ok", Map.of(
                        "status", "operational",
                        "sessions", sessions.size()
                    )));
                    return;
                }
                
                String[] parts =

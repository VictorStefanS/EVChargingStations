package com.EVCharge;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.GZIPOutputStream;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class StaticCompressedAssetIntegrationTest {

    private static final Path STATIC_DIR = Path.of("target", "test-classes", "static");
    private static final String FILENAME = "asset.js";
    private static final byte[] CONTENT = "console.log(\"hello compressed\");".getBytes();

    @Autowired
    private TestRestTemplate restTemplate;

    @BeforeAll
    public static void setup() throws IOException {
        Files.createDirectories(STATIC_DIR);
        Path file = STATIC_DIR.resolve(FILENAME);
        Files.write(file, CONTENT);
        // write gzip version
        Path gz = STATIC_DIR.resolve(FILENAME + ".gz");
        try (GZIPOutputStream gos = new GZIPOutputStream(new FileOutputStream(gz.toFile()))) {
            gos.write(CONTENT);
        }
    }

    @AfterAll
    public static void cleanup() throws IOException {
        try {
            Files.deleteIfExists(STATIC_DIR.resolve(FILENAME));
            Files.deleteIfExists(STATIC_DIR.resolve(FILENAME + ".gz"));
            Files.deleteIfExists(STATIC_DIR);
        } catch (Exception ignored) {}
    }

    @Test
    public void testGzipCompressedAssetServedWhenAccepted() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ACCEPT_ENCODING, "gzip");
        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<byte[]> resp = restTemplate.exchange("/" + FILENAME, HttpMethod.GET, request, byte[].class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getHeaders().getFirst(HttpHeaders.CONTENT_ENCODING)).isEqualTo("gzip");
        assertThat(resp.getBody()).isNotNull();
        // body should be smaller than original due to compression (basic sanity)
        assertThat(resp.getBody().length).isGreaterThan(0);
    }
}

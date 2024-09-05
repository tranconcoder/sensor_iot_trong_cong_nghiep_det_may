idf_component_register(SRCS "setup_rc522.c"
                    INCLUDE_DIRS "include"
                    REQUIRES esp-idf-rc522 esp_http_client config_http_client setup_esp32_cam mbedtls)

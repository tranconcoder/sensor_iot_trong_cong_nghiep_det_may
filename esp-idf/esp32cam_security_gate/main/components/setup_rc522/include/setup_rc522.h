#include "rc522.h"
#include <esp_log.h>
#include <inttypes.h>
#include "driver/gpio.h"

static rc522_handle_t scanner;
static const char *SETUP_RC522_TAG;

void setup_rc522();

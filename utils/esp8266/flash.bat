python -m esptool --port COM3 erase_flash
python -m esptool --port COM3 --baud 115200 write_flash --verify --flash_freq 80m --flash_mode dio --flash_size 4MB 0x0000 .\boot_v1.6.bin 0x1000 .\espruino_esp8266_user1.bin 0x3fc000 .\esp_init_data_default.bin 0x3fe000 .\blank.bin

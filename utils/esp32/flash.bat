python -m esptool --chip esp32 --port COM8 --baud 115200 write_flash -z --flash_mode "dio" --flash_freq "40m" 0x1000 bootloader.bin 0x10000 espruino_esp32.bin 0x8000 partitions_espruino.bin
python -m esptool --chip esp32 --port COM8 --baud 115200 write_flash -z --flash_mode "dio" --flash_freq "40m" 0x1000 bootloader.bin 0x10000 espruino_esp32SD.bin 0x8000 partitions_espruino.bin

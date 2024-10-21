import configparser
import os
from app.utils.translations import MESSAGES
from flask import request

def get_message(key: str, lang: str = 'en') -> str:
    """
    Lấy thông điệp từ từ điển MESSAGES dựa trên ngôn ngữ và khóa.
    Nếu khóa không tồn tại trong ngôn ngữ được yêu cầu, trả về thông điệp
    từ ngôn ngữ mặc định (es).
    """
    return MESSAGES.get(lang, {}).get(key, MESSAGES.get('es', {}).get(key, key))

def get_locale() -> str:
    """
    Lấy ngôn ngữ từ header 'Accept-Language' của yêu cầu.
    Nếu không có header, trả về 'es' làm ngôn ngữ mặc định.
    """
    accept_language = request.headers.get('Accept-Language', 'en')
    locale = accept_language.split(',')[0].strip()
    if locale not in MESSAGES:
        locale = 'en'
    return locale

def load_messages(lang: str) -> dict:
    # Define the path to the configuration file based on the language
    config_path = f'path/to/config/{lang}.ini'
    
    # Check if file exists
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Properties file for language '{lang}' not found: {config_path}")

    config = configparser.ConfigParser()
    
    try:
        # Attempt to read the file with UTF-8 encoding
        config.read(config_path, encoding='utf-8')
    except UnicodeDecodeError:
        raise ValueError(f"Unable to decode the file {config_path}. Check the file's encoding.")
    
    messages = {}
    for section in config.sections():
        for key, value in config.items(section):
            messages[f"{section}.{key}"] = value
            
    return messages

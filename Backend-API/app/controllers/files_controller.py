from flask import send_from_directory, current_app, abort
import os

def getFile(filename):
    # Lấy đường dẫn tuyệt đối của thư mục uploads
    uploads_folder = os.path.abspath(os.path.join(current_app.root_path, '..', 'uploads'))
    
    print(f"Uploads folder path: {uploads_folder}")  # Log để kiểm tra đường dẫn tuyệt đối

    # Tạo đường dẫn đầy đủ tới file
    file_path = os.path.join(uploads_folder, filename)
    
    # Kiểm tra xem file có tồn tại không
    if not os.path.exists(file_path):
        # Nếu không tìm thấy file, trả về lỗi 404
        abort(404, description=f"File '{filename}' not found.")
    
    try:
        # Gửi file hình ảnh từ thư mục uploads, hỗ trợ thư mục con
        return send_from_directory(
            uploads_folder,  # Thư mục chứa ảnh
            filename,         # Đảm bảo filename có thể bao gồm cả thư mục con
            as_attachment=False  # Trả về file mà không phải tải xuống
        )
    except Exception as e:
        # Nếu có lỗi xảy ra, trả về lỗi 500
        return f"An error occurred: {str(e)}", 500

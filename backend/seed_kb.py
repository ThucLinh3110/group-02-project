import asyncio
import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.backend.database import get_db, AsyncSessionLocal
from src.backend.models import Article

articles_data = [
  {
    "title": "Hướng dẫn xử lý lỗi không thể kết nối VPN từ nhà",
    "content": "1. Yêu cầu user kiểm tra lại kết nối mạng Wifi/Lan tại nhà. 2. Kiểm tra mã OTP. 3. Xóa Address History trong Cisco AnyConnect. 4. IT kiểm tra tài khoản AD có bị khóa không.",
    "category": "Network",
    "tags": ["VPN", "Kết nối", "Work from home"]
  },
  {
    "title": "Xử lý sự cố máy in không hoạt động / Offline",
    "content": "1. Kiểm tra cáp nguồn và cáp LAN. 2. Khởi động lại dịch vụ Print Spooler. 3. Mở nắp trước, từ từ rút giấy kẹt theo chiều giấy ra.",
    "category": "Hardware",
    "tags": ["Máy in", "Offline", "Print Spooler", "Kẹt giấy"]
  },
  {
    "title": "Hướng dẫn mở khóa tài khoản và Reset Password",
    "content": "1. Xác minh danh tính user. 2. Truy cập Active Directory (AD). 3. Chọn Unlock Account. 4. Reset Password và yêu cầu user đổi password ở lần đăng nhập tiếp theo.",
    "category": "Account",
    "tags": ["Mật khẩu", "AD", "Unlock", "Reset Password"]
  },
  {
    "title": "Xử lý lỗi Outlook không nhận được email / Báo đầy dung lượng",
    "content": "1. Dọn dẹp thư mục Deleted Items và Junk Email. 2. Dùng tính năng Clean Up Old Items. 3. Kiểm tra dung lượng mailbox. 4. IT nâng cấp license hoặc tăng dung lượng Exchange nếu cần.",
    "category": "Software",
    "tags": ["Outlook", "Email", "Đầy bộ nhớ", "Exchange"]
  },
  {
    "title": "Màn hình ngoài không lên hình / Chớp tắt liên tục",
    "content": "1. Kiểm tra đèn nguồn màn hình. 2. Cắm chặt cáp HDMI hoặc Type-C. 3. Bấm Win + P và chọn Extend. 4. Kiểm tra và cập nhật driver card màn hình.",
    "category": "Hardware",
    "tags": ["Màn hình", "No Signal", "HDMI", "Type-C", "Driver"]
  },
  {
    "title": "Lỗi không kết nối được Wi-Fi công ty",
    "content": "1. Forget mạng Wi-Fi hiện tại. 2. Kết nối lại và nhập đúng thông tin tài khoản công ty. 3. Khởi động lại Wi-Fi trên thiết bị. 4. IT kiểm tra địa chỉ MAC có bị blacklist trên hệ thống Cisco/Aruba không.",
    "category": "Network",
    "tags": ["Wi-Fi", "Không kết nối", "Mạng", "MAC", "Cisco", "Aruba"]
  },
  {
    "title": "Lỗi không đăng nhập được phần mềm Kế toán / ERP MISA",
    "content": "1. Đảm bảo thiết bị đang sử dụng mạng công ty hoặc VPN. 2. Xóa cache trình duyệt hoặc khởi động lại ứng dụng. 3. Kiểm tra trạng thái tài khoản. 4. Kiểm tra hệ thống MISA có đang hoạt động không.",
    "category": "System",
    "tags": ["ERP", "MISA", "Đăng nhập", "Hệ thống"]
  },
  {
    "title": "Hướng dẫn xử lý khi User nhận được Email lừa đảo (Phishing)",
    "content": "1. KHÔNG CLICK VÀO LINK hoặc tải file đính kèm đáng ngờ. 2. Forward email về bộ phận Security tại security@company.com. 3. IT kiểm tra và chặn tên miền hoặc người gửi nếu cần. 4. Nếu user đã click hoặc nhập thông tin, lập tức báo IT để khóa tài khoản và force reset password.",
    "category": "Security",
    "tags": ["Phishing", "Lừa đảo", "Bảo mật", "Email lạ"]
  },
  {
    "title": "Xử lý Laptop bị phồng pin / Mau hết pin",
    "content": "1. Nếu pin bị phồng, lập tức tắt máy và rút sạc. 2. Không tiếp tục sử dụng hoặc tự tháo pin. 3. Báo IT để kiểm tra thiết bị. 4. Cấp phát laptop dự phòng nếu cần. 5. IT thực hiện thay thế và xử lý pin theo quy trình an toàn.",
    "category": "Hardware",
    "tags": ["Pin laptop", "Phồng pin", "Mau hết pin", "An toàn"]
  },
  {
    "title": "Yêu cầu cài đặt phần mềm mới (Quyền Admin)",
    "content": "1. IT kiểm tra phần mềm có nằm trong Whitelist không. 2. Kiểm tra tình trạng license. 3. Xác minh yêu cầu cài đặt của user. 4. IT thực hiện cài đặt bằng tài khoản có quyền Admin hoặc công cụ remote được công ty cho phép.",
    "category": "Software",
    "tags": ["Cài đặt phần mềm", "Admin", "License", "Quyền"]
  },
  {
    "title": "Xử lý máy tính chạy chậm / Hiệu suất thấp",
    "content": "1. Kiểm tra CPU, RAM và Disk trong Task Manager. 2. Đóng các ứng dụng không cần thiết. 3. Kiểm tra dung lượng ổ đĩa. 4. Xóa file tạm và các ứng dụng không sử dụng. 5. Nếu vẫn chậm, IT kiểm tra tình trạng phần cứng.",
    "category": "Hardware",
    "tags": ["Máy tính chậm", "CPU", "RAM", "Disk", "Hiệu suất"]
  },
  {
    "title": "Không thể truy cập thư mục dùng chung trong mạng nội bộ",
    "content": "1. Kiểm tra thiết bị có kết nối mạng công ty hoặc VPN không. 2. Kiểm tra đường dẫn thư mục. 3. Kiểm tra quyền truy cập của tài khoản. 4. IT kiểm tra permission trên server và cấp quyền nếu user được phê duyệt.",
    "category": "Network",
    "tags": ["Shared Folder", "Network Drive", "Permission", "Server"]
  },
  {
    "title": "Lỗi không thể gửi email nhưng vẫn nhận được email",
    "content": "1. Kiểm tra kết nối Internet. 2. Kiểm tra địa chỉ email người nhận. 3. Kiểm tra Outbox có email đang bị treo không. 4. Kiểm tra dung lượng mailbox. 5. Nếu vẫn không gửi được, IT kiểm tra trạng thái tài khoản và Exchange.",
    "category": "Software",
    "tags": ["Outlook", "Email", "Không gửi được", "Exchange", "Outbox"]
  },
  {
    "title": "Hướng dẫn xử lý lỗi Microsoft Teams không đăng nhập được",
    "content": "1. Kiểm tra kết nối Internet. 2. Kiểm tra tài khoản Microsoft 365. 3. Đăng xuất và đăng nhập lại. 4. Xóa cache Microsoft Teams. 5. Nếu vẫn lỗi, IT kiểm tra trạng thái tài khoản và dịch vụ Microsoft 365.",
    "category": "Software",
    "tags": ["Microsoft Teams", "Login", "Microsoft 365", "Cache"]
  },
  {
    "title": "Không thể truy cập Internet trên máy tính công ty",
    "content": "1. Kiểm tra biểu tượng Network trên máy tính. 2. Kiểm tra kết nối Wi-Fi hoặc LAN. 3. Thử truy cập một website khác. 4. Khởi động lại Network Adapter. 5. IT kiểm tra DNS, IP và chính sách Firewall nếu lỗi vẫn tiếp diễn.",
    "category": "Network",
    "tags": ["Internet", "LAN", "Wi-Fi", "DNS", "IP", "Firewall"]
  },
  {
    "title": "Hướng dẫn xử lý máy tính bị treo hoặc không phản hồi",
    "content": "1. Chờ một vài phút để xác định hệ thống có đang xử lý tác vụ hay không. 2. Thử Ctrl + Alt + Delete. 3. Đóng ứng dụng đang bị treo nếu có thể. 4. Nếu máy hoàn toàn không phản hồi, thực hiện khởi động lại. 5. Nếu lỗi lặp lại, IT kiểm tra phần cứng và phần mềm.",
    "category": "Hardware",
    "tags": ["Máy tính treo", "Not Responding", "Restart", "Hardware"]
  },
  {
    "title": "Xử lý lỗi USB không nhận thiết bị",
    "content": "1. Rút USB và cắm lại vào cổng khác. 2. Kiểm tra USB có hoạt động trên thiết bị khác không. 3. Kiểm tra Device Manager. 4. Cập nhật hoặc cài lại USB Driver nếu cần. 5. Nếu vẫn không nhận, IT kiểm tra cổng USB hoặc thiết bị.",
    "category": "Hardware",
    "tags": ["USB", "Không nhận thiết bị", "Driver", "Device Manager"]
  },
  {
    "title": "Hướng dẫn kết nối máy tính với máy in mạng",
    "content": "1. Đảm bảo máy tính và máy in cùng mạng nội bộ. 2. Kiểm tra địa chỉ IP của máy in. 3. Vào Settings > Printers & scanners. 4. Thêm máy in bằng IP hoặc tên máy in. 5. In thử một trang để kiểm tra kết nối.",
    "category": "Hardware",
    "tags": ["Máy in", "Network Printer", "IP", "Printers", "Kết nối"]
  },
  {
    "title": "Xử lý lỗi tài khoản không có quyền truy cập hệ thống",
    "content": "1. Xác minh tài khoản và hệ thống mà user cần truy cập. 2. Kiểm tra user đã được cấp quyền hay chưa. 3. Kiểm tra role hoặc group của user. 4. Nếu chưa có quyền, IT thực hiện cấp quyền sau khi có phê duyệt từ người có thẩm quyền.",
    "category": "Account",
    "tags": ["Permission", "Role", "Access", "Tài khoản", "Phân quyền"]
  },
  {
    "title": "Hướng dẫn xử lý khi nghi ngờ máy tính nhiễm mã độc",
    "content": "1. Ngắt kết nối mạng nếu có dấu hiệu bất thường nghiêm trọng. 2. Không tự ý xóa các file hoặc chương trình đáng ngờ. 3. Báo ngay cho IT hoặc Security. 4. IT thực hiện kiểm tra bằng công cụ bảo mật của công ty. 5. Nếu xác định có mã độc, thực hiện cô lập và xử lý thiết bị theo quy trình bảo mật.",
    "category": "Security",
    "tags": ["Malware", "Virus", "Mã độc", "Security", "Bảo mật"]
  }
]

async def seed():
    async with AsyncSessionLocal() as db:
        for data in articles_data:
            new_article = Article(
                title=data["title"],
                category=data["category"],
                content=data["content"]
            )
            db.add(new_article)
        await db.commit()

if __name__ == "__main__":
    asyncio.run(seed())

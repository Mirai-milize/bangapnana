

import http.server
import socketserver
import os

# --- 설정 ---
PORT = 8000
DIRECTORY = os.path.dirname(__file__) # 파일이 있는 디렉토리
# ------------

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

# 서버 시작
try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"서버가 시작되었습니다. http://localhost:{PORT} 에서 접속하세요.")
        print("서버를 중지하려면 터미널에서 Ctrl+C 를 누르세요.")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n서버를 중지합니다.")
    exit()
except Exception as e:
    print(f"서버 시작 중 오류 발생: {e}")



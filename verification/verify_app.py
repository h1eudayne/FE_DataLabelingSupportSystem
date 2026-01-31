from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to http://localhost:3000")
            page.goto("http://localhost:3000")

            # Wait for the main heading to ensure page loaded
            print("Waiting for 'Số hóa dữ liệu' text...")
            expect(page.get_by_text("Số hóa dữ liệu")).to_be_visible(timeout=10000)

            print("Page loaded successfully. Taking screenshot.")
            page.screenshot(path="verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()

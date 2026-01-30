from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        print("Navigating to login page...")
        # Retry logic for server startup
        for i in range(10):
            try:
                page.goto("http://localhost:3000/login")
                break
            except Exception:
                print(f"Server not ready, retrying {i+1}/10...")
                time.sleep(2)

        page.wait_for_selector("text=Chào mừng trở lại!", timeout=10000)
        print("Login page loaded.")
        page.screenshot(path="login_page.png")
        print("Screenshot saved to login_page.png")

        # Verify specific texts
        if page.locator("text=Chào mừng trở lại!").is_visible():
             print("Heading found.")
        else:
             print("Heading NOT found.")

        if page.locator("button:has-text('Đăng nhập')").is_visible():
             print("Login button found.")
        else:
             print("Login button NOT found.")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="error_state.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)

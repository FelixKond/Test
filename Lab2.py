from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium import webdriver
import unittest
import time

class BasePage:
    def __init__(self):
        self.URL = "https://mospolytech.ru/"
        options = webdriver.EdgeOptions()
        options.add_argument("--start-maximized")
        self.driver = webdriver.Edge(options=options)

    def find_element(self, locator, time=15):
        return WebDriverWait(self.driver, time).until(
            EC.presence_of_element_located(locator),
            message=f"Can't find element by locator {locator}"
        )

    def find_elements(self, locator, time=15):
        return WebDriverWait(self.driver, time).until(
            EC.presence_of_all_elements_located(locator),
            message=f"Can't find elements by locator {locator}"
        )

    def start_session(self):
        return self.driver.get(self.URL)

    def stop_session(self):
        return self.driver.close()

class Locators:
    OPEN_BTN_LIST = (By.CLASS_NAME, "hamburger")
    STUDENTS = (By.XPATH, "//a[@title='Обучающимся']")
    SCHEDULE = (By.XPATH, "//a[@title='Расписания']")
    SCHEDULE_URL = (By.XPATH, "//a[@href='https://rasp.dmami.ru/']")
    INPUT = (By.CLASS_NAME, "groups")
    GROUP = (By.ID, "221-322")
    PARENT = (By.CLASS_NAME, "schedule-day_today")
    DAY = (By.CLASS_NAME, "schedule-day__title")

class MyPage(BasePage):
    def get_screenshot(self):
        self.driver.save_screenshot("screenshot.png")

    def open_list(self):
        self.find_element(Locators.OPEN_BTN_LIST).click()
        time.sleep(1)
        return len(self.find_elements(Locators.STUDENTS))

    def go_to_table(self):
        element = self.find_elements(Locators.STUDENTS)[1]
        action = webdriver.ActionChains(self.driver).move_to_element(element)
        action.perform()
        time.sleep(1)
        element = self.find_elements(Locators.SCHEDULE)[0]
        element.click()
        time.sleep(1)
        element = self.find_elements(Locators.SCHEDULE_URL)[0]
        element.click()
        time.sleep(1)
        return self.driver.title

    def checking_schedule(self):
        self.driver.switch_to.window(self.driver.window_handles[1])
        self.find_element(Locators.INPUT).send_keys("221-322")
        self.find_element(Locators.GROUP).click()
        time.sleep(1)

    def check_color(self):
        parent = self.find_element(Locators.PARENT)
        data = parent.find_element(*Locators.DAY).text
        time.sleep(1)
        return data

class TestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pg = MyPage()
        cls.pg.start_session()

    @classmethod
    def tearDownClass(cls):
        cls.pg.stop_session()

    def tearDown(self):
        if hasattr(self._outcome, 'errors'):
            result = self.defaultTestResult()
            self._feedErrorsToResult(result, self._outcome.errors)
        else:
            result = self._outcome.result

        if result.failures or result.errors:
            self.pg.get_screenshot()

    def test_1(self):
        res = self.pg.open_list()
        self.assertEqual(res, 3)

    def test_2(self):
        res = self.pg.go_to_table()
        self.assertEqual(res, "Расписания")
        self.pg.checking_schedule()

    def test_3(self):
        WEEKDAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
        res = self.pg.check_color()
        now = time.localtime()
        weekday_index = now.tm_wday
        self.assertEqual(res, WEEKDAYS[weekday_index])

if __name__ == '__main__':
    unittest.main(warnings='ignore', failfast=True)

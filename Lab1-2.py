from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium import webdriver
import unittest
import time

class BasePage:
    def __init__(self):
        self.URL = "https://lambdatest.github.io/sample-todo-app/"
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
    START_TEXT = (By.CLASS_NAME, "ng-binding")
    UNCLICKED_ELEMS = (By.CLASS_NAME, "done-false")
    CLICKED_ELEMS = (By.CLASS_NAME, "done-true")
    BTN = (By.CLASS_NAME, "btn-primary")
    INPUT = (By.ID, "sampletodotext")
    NEW_EL = "NEW_ELEMENT"

class MyPage(BasePage):
    def cheking_start_text(self):
        txt = self.find_element(Locators.START_TEXT).text
        return txt

    def take_first_elem(self):
        return list(map(lambda x: x.text, self.find_elements(Locators.UNCLICKED_ELEMS)))[0]

    def action_click_elements(self):
        elements = list(map(lambda x: x.text, self.find_elements(Locators.UNCLICKED_ELEMS)))

        for i in range(len(elements)):
            position = i + 1
            self.find_element((By.NAME, f"li{position}")).click()
            last_el = list(map(lambda x: x.text, self.find_elements(Locators.CLICKED_ELEMS)))[-1]
            time.sleep(1)
            
        self.find_element(Locators.INPUT).send_keys(Locators.NEW_EL)
        time.sleep(1)
        self.find_element(Locators.BTN).click()
        time.sleep(1)
        self.find_element((By.NAME, f"li{position + 1}")).click()
        time.sleep(1)
        return last_el

    def check_action_click_element(self):
        last_el = list(map(lambda x: x.text, self.find_elements(Locators.CLICKED_ELEMS)))[-1]
        return last_el

    def check_count(self):
        return len(list(map(lambda x: x.text, self.find_elements(Locators.CLICKED_ELEMS))))

class TestCase(unittest.TestCase):
  
    @classmethod
    def setUpClass(cls):
        cls.pg = MyPage()
        cls.pg.start_session()

    @classmethod
    def tearDownClass(cls):
        cls.pg.stop_session()

    def test_1(self):
        res = self.pg.cheking_start_text()
        self.assertEqual(res, "5 of 5 remaining")

    def test_2(self):
        res = self.pg.take_first_elem()
        self.assertEqual(res, "First Item")

    def test_3(self):
        res = self.pg.action_click_elements()
        self.assertEqual(res, "Fifth Item")

    def test_4(self):
        res = self.pg.check_action_click_element()
        self.assertEqual(res, Locators.NEW_EL)

    def test_5(self):
        res = self.pg.check_count()
        self.assertEqual(res, 6)

if __name__ == '__main__':
    unittest.main(warnings='ignore')

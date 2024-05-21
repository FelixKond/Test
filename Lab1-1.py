import time
from selenium import webdriver
from selenium.webdriver.common.by import By

URL = "https://lambdatest.github.io/sample-todo-app/"
initial_completed_count = "5 of 5 remaining"
initial_task_to_swap = "First Item"

driver = webdriver.Chrome(options=webdriver.ChromeOptions())
driver.get(URL)

initial_task_count_text = driver.find_element(By.CLASS_NAME, "ng-binding").text
assert initial_task_count_text == initial_completed_count, "Initial task count assertion failed"

tasks = [task.text for task in driver.find_elements(By.CLASS_NAME, "done-false")]

for i, task in enumerate(tasks):
    if task == initial_task_to_swap:
        position = i + 1
        try:
            driver.find_element(By.NAME, f"li{position}").click()
            last_completed_task = [task.text for task in driver.find_elements(By.CLASS_NAME, "done-true")][-1]
            assert initial_task_to_swap == last_completed_task, "Task completion assertion failed"
            print(last_completed_task)
            initial_task_to_swap = tasks[position]
        except:
            time.sleep(1)
            driver.find_element(By.ID, "sampletodotext").send_keys("New element")
            time.sleep(1)
            driver.find_element(By.CLASS_NAME, "btn-primary").click()
            time.sleep(1)
            driver.find_element(By.NAME, f"li{position + 1}").click()
    time.sleep(1)

last_completed_task = [task.text for task in driver.find_elements(By.CLASS_NAME, "done-true")][-1]
assert last_completed_task == "New element", "Last task completion assertion failed"

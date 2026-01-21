import {test,expect} from '@playwright/test'
test("newwebsite",async({page})=>{
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");
    await page.locator('input[name="radioButton"]').nth(1).click();
    await page.getById('checkBoxOption2').click();
    //await page.locator('input[name="checkBoxOption2"]').click();
    await page.locaotr('input[href="https://www.qaclickacademy.com/"]').click();
   })
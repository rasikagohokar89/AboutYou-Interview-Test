import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://en.aboutyou.de/your-shop');
  await page.getByTestId('LinkToUrl_SALE').click();
  await page.getByTestId('uc-footer').click();
  await page.getByTestId('uc-close-button').click();
  await page.getByRole('button', { name: 'Ok' }).click();
  await page.getByTestId('productTile-19207137').click();
  await page.getByTestId('sizeFlyoutOpener').click();
  await page.getByTestId('sizeOption_70099026_selected').click();
  await page.getByTestId('addToBasketButton').click();
  await page.getByTestId('continueShoppingButton').click();
  await page.getByTestId('proceedToCheckoutButton').click();
  await page.getByTestId('EmailField').click();
  await page.getByTestId('EmailField').fill('ww');
  await page.getByTestId('EmailField').click();
  await page.getByTestId('EmailField').dblclick();
  await page.getByTestId('EmailField').fill('');
  const page1Promise = page.waitForEvent('popup');
  await page.getByTestId('SSO-Button-google').click();
  const page1 = await page1Promise;
  await page1.locator('div').filter({ hasText: /^Email or phone$/ }).nth(1).click();
  await page1.getByRole('textbox', { name: 'Email or phone' }).click();
  await page1.goto('https://accounts.google.com/v3/signin/rejected?access_type=offline&app_domain=https%3A%2F%2Fayou-live.auth.scayle.cloud&client_id=960943421014-h75kic5fvee2uidc9ileol0eovaha3ii.apps.googleusercontent.com&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Fconsent%3Fauthuser%3Dunknown%26part%3DAJi8hANQFukNVMGuJOrH13dAm16oKkWiCJM1Pd14h5ZkhxUMOoC85U8tgYQ6NE6R-zi8ijnXtHhwHpwS4hwCRbvWLbX8k21hf2Ijlm4ozcRhLl4qkeTIJlQgPMAhJWs7vLL3DAkoBgeFr3f2N4YqnD64QCZalxNtX_o3nEKJT8qQXohZeGF6PS1ZtnFtDoDE_AjEF8w87F6maD7Z5Ts6WTuVIFfjI1s620GH6QZza7RZ8VclWc0NlW-iiTo7r7CbictnGWtdEViDmiqkWfNGEGum-fl_d_nyLnVHDvN4iODoWDQiXLQgERs5NcHfzoaw16KStkMjhymV07PR1XObQcDNw6TfBi1yC435FE2VX8ylRgxwhOXk_-I9f3E1vAi7In9CabldWpMHxYLYNBtgzuAQDqeYdeGH4bN39X3lkKds8O7n9xSmql0vghIkWCemoKLRY9hSP8LoF79d5C31YRjH3MBGWmhloImR76IJ577EOKrzVTm8TIg%26flowName%3DGeneralOAuthFlow%26hl%3Den%26as%3DS-466976024%253A1783245530970948%26client_id%3D960943421014-h75kic5fvee2uidc9ileol0eovaha3ii.apps.googleusercontent.com%26requestPath%3D%252Fsignin%252Foauth%252Fconsent%23&dsh=S-466976024%3A1783245530970948&epd=ARMKLbaafe5yQCsFYPGvxQOaJw1GroAFhyRkbzrJ2CkdbvnSIC87IVCDSQ&flowName=GeneralOAuthFlow&hl=en&o2v=1&opparams=%253Fhl%253Den&prompt=consent%20%20select_account&rart=ANgoxcdChjEVXwxejOt0fJvahxi1IrM9fc5qjKLFU3OxoE2U-Lm7vIP0wk_82aEAsssLJ-fd8UR1DP3FVC6Smdt9HewfwUC7t3m7uq1hYJ5t4onBNM16wsY&redirect_uri=https%3A%2F%2Fayou-live.auth.scayle.cloud%2Fv1%2Fauth%2Fexternal%2Fcallback&response_type=code&rhlk=le&rrk=46&scope=openid%20profile%20email&service=lso&state=eyJpZHBJZCI6MjgsInNob3BJZCI6Njg4LCJjbGllbnRJZCI6NCwiZm9yd2FyZEp3dCI6ImV5SjBlWEFpT2lKS1YxUWlMQ0poYkdjaU9pSklVekkxTmlKOS5leUpwWkhCTFpYa2lPaUpuYjI5bmJHVWlMQ0pwWkhBaU9pSm5iMjluYkdVaUxDSmpiR2xsYm5SSlpDSTZJalFpTENKemFHOXdTV1FpT2lJMk9EZ2lMQ0prWlhacFkyVWlPaUprWlhOcmRHOXdMWGRsWWlJc0ltTmhiR3hpWVdOclZYSnNJam9pYUhSMGNITTZMeTlsYmk1aFltOTFkSGx2ZFM1a1pTOWZYeTl6YzI5ZlkyRnNiR0poWTJzX2MzTnZYMk5vWVc1dVpXdzlVMU5QWDBOSVFVNU9SVXhmTUhZd04zaHdibTQzZUdsdkpteHZaMmx1Um14dmR6MXNiMmRwYmlaMFlXSmZhV1E5TUhZd04zaHdibTQzZUdsdklpd2ljMmxuYm1Wa1UzUmhkR1VpT2lKbGVVcG9Za2RqYVU5cFNrbFZla2t4VG1sSmMwbHVValZqUTBrMlNXdHdXRlpEU2prdVpYbEtjRnBJUW1aaE1sWTFTV3B2YVZveU9YWmFNbmhzU1dsM2FXRlhVbmRKYW05cFdqSTVkbG95ZUd4SmFYZHBXa2RXTW1GWFRteEphbTlwV2tkV2VtRXpVblpqUXpFeldsZEphVXhEU25waFJ6bDNXREpzYTBscWIybE9hbWMwU1dsM2FWcFlhSGRKYW05NFRucG5lazlFVlhkTmVrRjZURU5LY0ZsWVVXbFBha1V6VDBSTmVVNUVWVEZOUkU0NUxuSkRVbDlRWnpCeGJXNDVZbEJaTkhCdVN6UnROazlHTW1saWNUUldTRGhMZHpkeVNtTktXRzR5WTJjaUxDSmxlSEFpT2pFM09ETTROVEF6TURNc0ltbGhkQ0k2TVRjNE16STBOVFV3TTMwLm5KWERpdk9jSVRkbW0zR0lnR0J3YXkwMHlWc2RKV1NBdVJVNzlnV0JQRVEifQ%3D%3D');
  await page1.getByRole('link', { name: 'Try again' }).click();
});
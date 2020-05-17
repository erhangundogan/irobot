IRobot
======

Download hcaptcha challenge images using puppeteer.

Install
=======

```bash
$ yarn
```

Run
===

Provide env variable `CAPTCHA_DOMAIN` for the hcaptcha domain and run command below. You can also edit `start` command to provide env variable.

```bash
$ yarn start
```

If all goes well application downloads captcha challenge images into the `images/` folder and also saves screenshot to `ss/` folder. You would also see challenge keyword in the console:

```
Keyword is: motorcycle
```

If it doesn't work you would get error in the console (no hcaptcha page, network error, hcaptcha update in the source code etc.).

If it works then you could use deep neural network to identify image and do whatever you want. Good luck ;)

Image below downloaded by using irobot and identified by [opencv](https://github.com/opencv/opencv) with [darknet](https://pjreddie.com/darknet/).

![dnn](https://github.com/erhangundogan/irobot/blob/master/dnn.png)

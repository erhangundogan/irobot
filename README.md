IRobot
======

IRobot is a tool to download hcaptcha challenge images from any website using puppeteer.

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

If all goes well application downloads captcha challenge images into the `images/` folder and also saves screenshot to `ss/` folder.

You would also see challenge keyword on the console:

```
Keyword is: motorcycle
```

From that point you can use deep neural networks to identify images and respond to the hcaptcha. Good luck! ;)

Image sample below retrieved from hcaptcha and identified by using [opencv](https://github.com/opencv/opencv) and [darknet](https://pjreddie.com/darknet/).

![dnn](https://github.com/erhangundogan/irobot/blob/master/dnn.png)

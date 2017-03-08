### Dumpert Samsung SmartHub TV app

An Angular application for the #1 video site of Holland **Dumpert** for _Samsung SmartHub TVs (2012 - 2014)_.

#### 10 Steps to success
0. Own a Samsung Smarthub TV 
1. Install NPM if you haven't already, preferably the latest build
2. Install TypeScript ```npm install -g typescript@lastest```
3. Install Gulp ```npm install -g gulp```
4. Install all modules from package.json ```npm install```
5. Compile typescript files
6. Bundle all required nodemodules and compiled typescript js files
7. Copy the bundles, the assets folder and the SST files to dist folder
8. Minify the bundled app and vendor js files for faster load speed on the SST device
9. Install Apache and run a server on port 80
10. ZIP compress the dist folder and move the zip file under the www/Widget/ folder inside your Apache server

After installing an Apache server (LAMP for Linux, WAMP for Windows, or MAMP for Mac OS) navigate to the www directory inside the root folder of the Apache server. Create a new folder ```mkdir ./Widget/``` and create a new file ```touch ./widgetlist.xml```. The XML file will notify our Samsung SmartHub TV which application(s) we want it to download/update onto our TV.

Onto building the XML file for downloading. Open the XML file in your favorite editor and copy-paste the following into the opened file:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rsp stat="ok">
  <list>
    <widget id="DumpertTV">
      <title>DumpertTV</title>
      <compression size="3383543" type="zip" />
      <description>Dumpert application for Samsung Smarthub TV</description>
      <download>http://IP_ADDRESS/Widget/dist.zip</download>
    </widget>
  </list>
</rsp>
```
Important to note is the compression size, if the compressed dist folder of our app is more than the set compression size, the app will not be downloaded onto our device. So check the filesize and change the compression size accordingly. I used the default compression size from the legacy SDK. The TV will try to download the file from the path defined in the download tag of this XML file. Find your ip ```ifconfig eth0 | grep 'inet addr:'``` and set your IP address in the download tag.

To bundle all node modules and other dependencies and to generate the dist folder, I have found an Angular 2 production bundler repo that uses Gulp to build and bundle all dependencies. All credits for this goes to [Anjmao - Angular2 Production Workflow](https://github.com/Anjmao/angular2-production-workflow). The skeleton of this application was forked from this repository. I have altered the Gulp file to minify the bundled application and added a task to zip the ```dist``` task. Bundling the app as stated on the repository:

> We can do the bundling step using SystemJs builder which take care of all bundling step and gulp-html-replace for replacing script tags with bundled version. Now run ```gulp dist``` ( or ```gulp distz``` for compressed zip) and everythink needed to run app should be compiled to dist folder.

To finish up all steps, zip compress the dist folder and move that compressed zip file to the Widget folder you created in your www directory of the Apache server. Boot up your Samsung SmartHub TV and start SmartHub. Sign in or sign up as ```develop``` with password ```000000```. Go to Tools->Settings->Development. Accept the terms of agreement. Configure the IP address, enter the IP address of your Apache server ```ipconfig eth0 | grep 'inet addr:'```, hit back and synchronize. When everything is correctly configured, this should download the Dumpert SST application onto your device. - "5 reeten".

#### Tizen (Samsung Smart TV 2014+)
The application should work on Tizen devices as well, just follow steps 1 through 7 and then follow the official instructions for your Tizen device for app development.
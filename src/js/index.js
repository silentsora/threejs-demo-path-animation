
/*
*
*  引入lib库文件和LESS文件
*  必须要引入,过滤器会过滤lib文件夹里面的JS文件,做一个简单的复制
*  复制到相应的文件夹
*  引入的less会对less进行编译存放到css文件夹
* */
import '../less/style.less';
import Loading from './app/Loading.js';
import Video from './app/Video.js';
import End from './app/End.js';
import Scene from './app/Scene.js';

class Index {
    constructor () {
        this.loadingCtrl = new Loading();
        this.videoCtrl = new Video();
        this.endCtrl = new End();
        this.sceneCtrl = new Scene();
    }

    async phaseLoad () {
        this.loadingCtrl.init();
        await this.loadingCtrl.preload();
        await this.loadingCtrl.mainLoad();
        // await this.loadingCtrl.promiseOnload();
        this.phaseScene();
    }

    phaseScene () {
        this.sceneCtrl.init();
    }
}

const index = new Index();
index.phaseLoad();

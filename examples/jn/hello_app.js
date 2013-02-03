seajs.use(['er/Action', 'er/controller', 'er/locator'],
function(A, controller, locator){

// "template!jn/hello_app.tpl.html", "css!base.css", "css!themes/base.css"

function HelloApp() {
    A.Action.call(this);
    this.view = 'VIEW_hello_app';
}
baidu.inherits(HelloApp, A.Action);

var hello_app = {
    config: {
        action: [
            {
                location: '/jn/hello_app',
                action: HelloApp
            },
        ]
    }
}
controller.addModule(hello_app);
controller.init();
locator.redirect('/jn/hello_app');
});

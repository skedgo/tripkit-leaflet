class Messenger {

    constructor(){
        this.messenger = L.DomUtil.create("div")
        this.messenger.className =  "messenger";
        document.body.appendChild(this.messenger);

        this.message = null;
    }

    info(text){
        this.createMessage(text)
        this.message.className = "message";
        this.show();
    }

    createMessage(text){
        this.hideMessage();
        this.message = L.DomUtil.create("div");

        let span = L.DomUtil.create("span");
        span.innerHTML = text;
        this.message.appendChild(span);
        this.messenger.appendChild(this.message);
    }

    hideMessage(){
        if(this.message !== null){
            this.message.remove();
            this.message = null;
        }
        this.messenger.style.display = "none";
    }

    show(){
        this.messenger.style.display =  "block";
    }

    error(text, closeAfterMillis){
        if(closeAfterMillis == undefined)
            closeAfterMillis = 3000;

        this.info(text);

        setTimeout(function(){
            L.tripgoRouting.mapLayer.getMessenger().hideMessage();
        },closeAfterMillis);

    }
}
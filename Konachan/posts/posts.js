(async () => {
    const src = chrome.runtime.getURL("../Compiler.js");
    const Compiler = await import(src);

    Compiler.Compile(`
        // ## Syntax
        // SELECT "elem" AND CHANGE "background-color" TO "none";
        // SELECT ALL "elem" AND CHANGE "background-color" TO "none";
        // REMOVE BACKGROUND "header";
        // SELECT "header" AND CHANGE "background-color" TO "$var.Color.White";
        // VARIABLE "x" = "1";
        // CHANGE VARIABLE "$var.Color.Blue" TO "1";
        // RESET VARIABLE "$var.Color.Blue";

        // REMOVE BACKGROUND "header";
        // REMOVE BACKGROUND ".lightswitch";



        SELECT ALL "ul#post-list-posts li" AND CHANGE "width" TO "40%";
        SELECT ALL "ul#post-list-posts li" AND CHANGE "display" TO "inline-flex";
        SELECT ALL "ul#post-list-posts li" AND CHANGE "flex-direction" TO "column-reverse";
        SELECT ALL "ul#post-list-posts li" AND CHANGE "margin-left" TO "5%";
        SELECT ALL "ul#post-list-posts li" AND CHANGE "margin-top" TO "4%";


        SELECT ALL "ul#post-list-posts li .inner" AND CHANGE "width" TO "100%";
        SELECT ALL "ul#post-list-posts li .inner" AND CHANGE "height" TO "auto";


        SELECT ALL "img.preview" AND CHANGE "width" TO "auto";
        SELECT ALL "img.preview" AND CHANGE "height" TO "auto";
        SELECT ALL "img.preview" AND CHANGE "max-width" TO "100%";
        SELECT ALL "img.preview" AND CHANGE "max-height" TO "100%";
        SELECT ALL "img.preview" AND CHANGE "margin-top" TO "0px";
    `);


    const _a    = document.querySelectorAll("a.thumb");
    const _img  = document.querySelectorAll("img.preview");

    const NewImgURLs = Array
        .from(_a)
        .map((a, index) => {
            const img = _img[index].src.slice("https://".length).split("/");



            /* /post/show/350600/brown_hair-building-city-dress-flowers-headband-ko */
            const id = a.href.slice("https://".length).split("/")[3];

            /* konachan.com/data/preview/bb/64/bb647bc27c4df7bf8338733f02c68ae8.jpg */
            const token     = img[5].split(".")[0];
            const extension = img[5].split(".")[1];

            /* https://konachan.com/sample/bb647bc27c4df7bf8338733f02c68ae8/Konachan.com%20-%20350600%20sample.jpg */
            // Konachan.com - 350600 sample.jpg
            const URL = `https://konachan.com/sample/${token}/${encodeURIComponent(`Konachan.com - ${id} sample.${extension}`)}`;
            return URL;
        });

    _img.forEach((img, index) => {
        img.src = NewImgURLs[index];

        img.onerror = (event) => {
            const extensions            = ["sample", "jpeg", "png", "webp", "gif", "jpg", "image"];
            const current_extension     = event.target.src.slice("https://".length).split("/")[1].trim();

            const new_extension = extensions[extensions.indexOf(current_extension) + 1] !== undefined ?
                extensions[extensions.indexOf(current_extension) + 1]
                :
                extensions[0];

            event.target.src = event.target.src.replace(current_extension, new_extension);
        }
    });
})()
    .then(console.log)
    .catch(console.log);
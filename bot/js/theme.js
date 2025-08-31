const changeCSS = (cssFile, cssLinkIndex) => {
    var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);
    var newlink = document.createElement("link");
    newlink.setAttribute("rel", "stylesheet");
    newlink.setAttribute("type", "text/css");
    newlink.setAttribute("href", cssFile);
    document.getElementsByTagName("head").item(cssLinkIndex).replaceChild(newlink, oldlink);
}

document.querySelector('.bi-palette').addEventListener('click', function() {
    let themes = ['assets/css/themes/dark.css', 'assets/css/themes/glow.css', 'assets/css/themes/light.css']
    let link = document.querySelectorAll("link")
    let theme = link[0].href
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    //console.log(items[nextIndex], item)
    changeCSS(theme[nextIndex], 2)
}, false)

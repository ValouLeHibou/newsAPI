/* ########## FORMS DISPLAYING ########### */
function displayBook() {
    document.getElementById('bookmark').style.display = "initial";
    getBookmark();
}

function displayLogin() {
    document.getElementById('login').style.display = "initial";
}

function displaySignin() {
    document.getElementById('signin').style.display = "initial";
}

function closeForm() {
    document.getElementById('login').style.display = "none";
    document.getElementById('signin').style.display = "none";
    document.getElementById('bookmark').style.display = "none";
}


/* ########## LOGIN / SIGNIN / LOGOUT ########### */
function login(mail, pass) {
    closeForm();
    fetch("https://newsapp.dwsapp.io/api/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: mail, password: pass})
    })
    .then( response => response.ok ? response.json() : console.log(response) )
    .then( jsonData => {
        let userFirstName =  jsonData['data']['user']['firstname'];
        let userLastName =  jsonData['data']['user']['lastname'];
        let userToken =  jsonData['data']['token'];
        createCookie(userFirstName, userLastName, userToken);
    })
    .catch( err => console.error(err));
}

function signin(firstName, lastName, mail, pass) {
    closeForm();
    fetch("https://newsapp.dwsapp.io/api/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: mail, password: pass, firstname: firstName, lastname: lastName})
    })
        .then( response => response.ok ? response.json() : console.log(response) )
        .then( jsonData => { console.log(jsonData) })
        .catch( err => console.error(err));
}

function logout() {
    document.cookie = 'firstName=';
    document.cookie = 'lastName=';
    document.cookie = 'token=';
    location.reload();
}


/* ########## COOKIES CONFIGS ########### */
function createCookie(userFirstName, userLastName, userToken) {
    document.getElementById('userAccount').innerHTML = userFirstName + " " + userLastName;
    document.getElementById('userAccountToken').innerHTML = userToken;
    document.getElementById('hideAccount').style.display = "initial";
    document.cookie = 'firstName=' + userFirstName;
    document.cookie = 'lastName=' + userLastName;
    document.cookie = 'token=' + userToken;
    document.cookie = 'max-age=86400';

    let bookmarks = document.getElementsByClassName('bookmark');
    for (let i = 0; i < bookmarks.length; i++) {
        bookmarks[i].style.display = "initial";
    }
}


/* ########## ARTICLE CONFIGS AND PRINT ########## */
const printArticle = articleList => {
    for (const oneArticle of articleList["articles"]) {
        document.getElementById("mainSection").innerHTML += `
            <article>
                <div class='row card-panel hoverable valign-wrapper' onclick="openArticle('${oneArticle['url']}')">
                    <div class='col l4 s12'><img src="${oneArticle['urlToImage']}"/></div>
                    <div class='col l8 s12'>
                        <div class='row'>
                            <div class='col l12 title'>${oneArticle['title']}</div>
                            <div class='col l12 hide-on-med-and-down articleDescr'><p>${oneArticle['description']}</p></div>
                            <div class='col l6'>Author : ${oneArticle['author']}</div>
                            <div class='col l6 date'>Published at : ${oneArticle['publishedAt']}</div>
                            <div class="sourceId">${oneArticle['source']['id']}</div>
                            <div class="articleUrl" style="display: none">${oneArticle['url']}</div>
                        </div>
                    </div>
                </div>                
                <div class="row">
                    <div class="col l6">Source : ${oneArticle['source']['name']}</div>
                    <div class="bookmark col l6" onclick="addBookmark('${oneArticle['source']['id']}', '${oneArticle['title']}', '${oneArticle['description']}', '${oneArticle['url']}')">
                        <i class="material-icons">stars</i>
                    </div>
                </div>
            </article>
        `;
    }

    // CHECK IF SESSION IS ON
    let userToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if(userToken != "") {
        let userFirstName = document.cookie.replace(/(?:(?:^|.*;\s*)firstName\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        let userLastName = document.cookie.replace(/(?:(?:^|.*;\s*)lastName\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        createCookie(userFirstName, userLastName, userToken);
    }
}

function openArticle(url) {
    let win = window.open(url, '_blank');
    win.focus();
}

const updateArticle = (newSearchUrl, source, keyword) => {
    fetch(newSearchUrl)
        .then( response => response.ok ? response.json() : 'Response not OK' )
        .then( jsonData => {
            document.cookie= 'defaultSource=' + source;
            document.cookie= 'defaultkey=' + keyword;
            console.log(document.cookie);
            printArticle(jsonData)
        })
        .catch( err => console.error(err));
}
/* ############################################################### */


/* ########## BOOKMARKS ########## */
function addBookmark(sourceId, articleName, articleDescription, articleUrl) {
    let userToken = document.getElementById('userAccountToken').textContent;
    let category = "general";
    let language = "en";
    let country = "us"
    console.log(sourceId, articleName, articleDescription, articleUrl, userToken);

    fetch("https://newsapp.dwsapp.io/api/bookmark/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: sourceId, name: articleName, description: articleDescription, url: articleUrl, category: category, language: language, country: country, token: userToken})
    })
        .then( response => response.ok ? response.json() : console.log(response) )
        .then( jsonData => {console.log(jsonData); alert("Article ajouté aux favoris ! ;)") })
        .catch( err => console.error(err));
}

function getBookmark() {
    let userToken = document.getElementById('userAccountToken').textContent;

    document.getElementById("bookmarkList").innerHTML = '';
    fetch("https://newsapp.dwsapp.io/api/me", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({token: userToken})
    })
        .then( response => response.ok ? response.json() : console.log(response) )
        .then( jsonData => {
            let myBookmarkList = jsonData['data']['bookmark'];
            for (let i = 0; i < myBookmarkList.length; i++) {
                document.getElementById("bookmarkList").innerHTML += `
                    <article>
                        <div class='row card-panel hoverable' onclick="openArticle('${myBookmarkList[i]['url']}')">
                            <div class='col l12'>
                                <div style="font-weight: bold">${myBookmarkList[i]['name']}</div>
                                <div>${myBookmarkList[i]['description']}</div>
                            </div>
                        </div> 
                        <div class="row">
                            <div class="col l6" style="font-weight: lighter">From : ${myBookmarkList[i]['id']}</div>
                            <div class="trash col l6" onclick="deleteBookmark('${userToken}', '${myBookmarkList[i]['_id']}')"><i class="material-icons">block</i></div>
                        </div>            
                    </article>
                `;
            }
        })
        .catch( err => console.error(err));
}

function deleteBookmark(userToken, bookmarkId) {
    fetch("https://newsapp.dwsapp.io/api/bookmark/" + bookmarkId, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({token: userToken})
    })
        .then( response => response.ok ? response.json() : console.log(response) )
        .then( jsonData => { alert("Bookmark has been deleted !") })
        .then(res => getBookmark())
        .catch( err => console.error(err));
}


// PRINT SELECT OPTIONS FOR DROPDOWN MATERIALIZECSS LIST ANIMATION
const printOption = optionList => {
    for (const oneOption of optionList["sources"]) {
        document.getElementById("mySelect").innerHTML += `<option id="toto" value='${oneOption['id']}'>${oneOption['name']}</option>`;
    }
    let elems = document.querySelectorAll('select');
    let instances = M.FormSelect.init(elems, null);
}

function main() {
    let defaultUrl = ""
    let defaultSource = document.cookie.replace(/(?:(?:^|.*;\s*)defaultSource\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    let defaultKeyword = document.cookie.replace(/(?:(?:^|.*;\s*)defaultKey\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (defaultSource != "") {
        if (defaultKeyword != "") {
            defaultUrl = "https://newsapi.org/v2/everything?sources=" + defaultSource + "&q=" + defaultKeyword + "&apiKey=dab8a9a7ce7b4eeea8174c4ccdb343b5";
        } else {
            defaultUrl = "https://newsapi.org/v2/everything?sources=" + defaultSource + "&apiKey=dab8a9a7ce7b4eeea8174c4ccdb343b5";
        }
    }
    let sourceCallUrl = "https://newsapi.org/v2/sources?apiKey=dab8a9a7ce7b4eeea8174c4ccdb343b5";
    updateArticle(defaultUrl, defaultSource, defaultKeyword);
    fetch(sourceCallUrl)
        .then( response => response.ok ? response.json() : 'Response not OK' )
        .then( jsonData => { printOption(jsonData) })
        .catch( err => console.error(err));
}

main();



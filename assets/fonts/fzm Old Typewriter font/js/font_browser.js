let categoriesCache = '';
class FontBrowser {
    constructor(container, config) {
        this.config = config;
        this.setup(container, config);
        this.bindShowCategoriesAction();
        this.bindShowFontsAction();
        this.setFontOnclick();
        this.initUploadForm();
    }
    setup(container, config) {
        const domEl = this.domEl = container;
        var iframe = '<iframe style="width:98%; height:200px; border:none; margin: 10px 1%" frameBorder="0" src="//fontsforweb.com/user/pluginactivate?apikey=' + config.apikey + '&blogurl=' + config.fontBlogUrl + '"></iframe>';

        //create html within font browser
        show(domEl);
        domEl.innerHTML += `
        <h1 class="draggableModalBar"><a class="closeModal" href="#">x</a></h1>
        <div class="tablinks"><a class="tablink" href="fontslist">Fontsforweb.com</a><a class="tablink" href="uploaded">Upload</a><a class="tablink" href="pro">PRO settings</a></div>
        <div class="tab" id="fontslist"></div>
        <div class="tab" id="uploaded"><div class="loading"></div></div>
        <div class="tab" id="pro">${iframe}</div>
        `;

        hide(domEl.querySelectorAll('.tab'));
        show(domEl.querySelector('.tab'));
        domEl.querySelectorAll('.tablink').forEach(el => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                hide(domEl.querySelectorAll('.tab'));
                const target = event.target.getAttribute('href');
                show(document.getElementById(target));
                if (target === 'uploaded') {
                    this.loadPrivateFonts();
                }
            });
        });
        domEl.style.left = 0;

        // move to outside of font browser
        if (jQuery) { // last jQuery dep in this file
            jQuery(domEl).draggable({
                handle: jQuery(domEl.querySelector('.draggableModalBar'))
            });
        }
        domEl.addEventListener('mousedown', (event) => {
            const el = findDelegatedElement(event.target, '.draggableModal');
            if(!el) return;
            config.dragBarClicked(el);
        });
        domEl.querySelector('a.closeModal').addEventListener('click', function (event) {
            event.preventDefault();
            hide(domEl);
        });
        this.loadFontCategories();
    }
    /*
     *  Init fonts browser carousel
     */
    initCarousel() {
        // slick or owl instead
        // var carousel = this.domEl.find('#FFW_browser_carousel').fcarousel({
        //     buttonNextHTML: '<a href="#" onclick="return false;"></a>',
        //     buttonPrevHTML: '<a href="#" onclick="return false;"></a>',
        //     animation: 1000,
        //     scroll: 2
        // });
    }
    /*
     *  Load font categories
     */
    loadFontCategories() {
        if (categoriesCache) return this.actuallyLoad(categoriesCache);
        //make ajax request to get categories
        fetch(this.config.FFW_baseUrl + '/fontcategories/fontplugininit',
            {
                method: 'POST',
                body: toFormData({
                    apikey: this.config.apikey,
                    blogurl: this.config.fontBlogUrl,
                    ver: this.config.version
                }),
                format: 'html'
        }).then((data) => data.text()).then(data => {
            // if empty answer display error
            if (!data || data === '') {
                this.domEl.innerHTML = '<h1>An error has occurde</h1><p>Please try again later</p>';
            }
            categoriesCache = data;
            this.actuallyLoad(data);
        }).catch(e => { throw e });
    };
    actuallyLoad(data) {
        // hide loader
        hide(this.domEl.querySelector('.loading'));
        // show fonts list
        this.domEl.querySelector('#fontslist').innerHTML = data;
        // show fonts list
        if (this.domEl.querySelector('a.close_link')) {
            // bind close to close button
            this.domEl.querySelector('a.close_link').addEventListener('click', function () {
                hide(this.domEl);
            });
            // init carousel
            this.initCarousel();
        }
        this.addBackButtons();
        this.selectTab('#categoriesList');
    };
    selectTab(tab) {
        const carousel = document.getElementById('FFW_browser_carousel');
        Array.prototype.filter.call(carousel.children, el => el.matches('li')).forEach(li => hide(li));
        show(carousel.querySelector(tab));
    }
    /*
     * bind onclick to links to reveal subcategories
     */
    bindShowCategoriesAction() {
        this.domEl.addEventListener('click', (event) => {
            const el = findDelegatedElement(event.target, '#categoriesList .categoryChoose');
            if(!el) return;
            event.preventDefault();
            var categoryId = el.getAttribute('name');
            //hide all subcategories of other parents
            hide(this.domEl.querySelectorAll('#subcategoriesList li'));
            show(this.domEl.querySelectorAll('#subcategoriesList li.instructions'));
            //show all subcategories of this parent
            show(this.domEl.querySelectorAll('#subcategoriesList li#FFW_parentcategory_' + categoryId));
            this.selectTab('#subcategoriesList');
            // this.domEl.querySelector('.fcarousel-next').click();
        });
    };
    addBackButtons() {
        // back to categories
        const backButton = document.createElement('button');
        backButton.type = 'button';
        backButton.classList.add('btn');
        backButton.classList.add('btn-success');
        backButton.classList.add('btn-sm');

        backButton.innerHTML = '&lt; back';
        backButton.id = 'backToCategories';
        this.backButton = backButton.cloneNode(true);

        const header = this.domEl.querySelector('#subcategoriesList li.instructions');
        header.insertBefore(backButton, header.firstChild);
        this.domEl.querySelector('#backToCategories').addEventListener('click', () => {
            this.selectTab('#categoriesList');
        });
    }
    //bind onclick to reveal font of category
    bindShowFontsAction() {
        // bind onclick subcategories to load their fonts
        this.domEl.addEventListener('click', (event) => {
            const el = findDelegatedElement(event.target, '#subcategoriesList .categoryChoose');
            if(!el) return;
            event.preventDefault();
            var categoryId = el.getAttribute('name');
            fetch(this.config.FFW_baseUrl + '/fontcategories/wpfontsforwebcategoryfonts/catid/' + categoryId, {
                method: 'POST',
                body: toFormData({
                    apikey: this.config.apikey,
                    blogurl: this.config.fontBlogUrl
                }),
                format: 'html'
            }).then((data) => data.text()).then(data => {
                //if empty answer display error
                if (!data || data === '') {
                    this.domEl.innerHTML = '<h1>An error has occurde</h1><p>Please reload page</p>';
                }
                //apply content to div
                this.domEl.querySelector('#fontList').innerHTML = data;
                
                // back to subcategories
                const backToSubcategories = this.backButton.cloneNode(true);
                backToSubcategories.id = 'backToSubcategories';
                const header2 = this.domEl.querySelector('#fontList li.instructions');
                header2.insertBefore(backToSubcategories, header2.firstChild);
                header2.innerHTML += '<strong>Select font</strong';
                this.domEl.querySelector('#backToSubcategories').addEventListener('click', () => {
                    this.selectTab('#subcategoriesList');
                });
                //move carousel right
                // this.domEl.querySelector('.fcarousel-next').click();
                this.selectTab('#fontList');
            });
            return false;
        });
        // bind delete function
        this.domEl.addEventListener('click', (event) => {
            const el = findDelegatedElement(event.target, '#uploaded.delete');
            if(!el) return;
            event.preventDefault();
            if (!window.confirm("Are you sure you want to delete this font?")) {
                return false;
            }
            var fontId = el.getAttribute('name');
            fetch(this.config.FFW_baseUrl + '/api', {
                method: 'POST',
                body: toFormData({
                    action: 'deletefont',
                    apikey: this.config.apikey,
                    blogurl: this.config.fontBlogUrl,
                    fontid: fontId
                })
            }).then((data) => data.text()).then(data => {
                if (data.success === 'true') {
                    this.loadPrivateFonts();
                } else {
                    alert('Font deleting error.');
                    show(document.querySelector('fontUploadForm'));
                    hide(document.querySelector('fontUploading'));
                }
            });
        });
    };
    /*
     * when clicked on font in fonts browser
     */
    setFontOnclick() {
        //bind onclick font change action to font images
        this.domEl.addEventListener('click', (event) => {
            const el = findDelegatedElement(event.target, '.font_pick');
            if(!el) return;
            event.preventDefault();
            this.config.fontClicked(el.parentNode.getAttribute('title'), el.getAttribute('name'), el.parentNode.getAttribute('name'));
        });
    };

    /* 
     * Load uploaded fonts
     *
     */
    loadPrivateFonts() {
        //load private fonts
        fetch(this.config.FFW_baseUrl + '/font/getuserfonts', {
            method: 'POST',
            headers: {'Content-Type':'application/x-www-form-urlencoded'},
            body: toFormData({
                apikey: this.config.apikey,
                blogurl: this.config.fontBlogUrl,
                blogname: this.config.fontBlogName
            }),
            format: 'html'
        }).then((data) => data.text()).then(data => {
            this.domEl.querySelector('#uploaded').innerHTML = data;
        });
    };
    /*
     * Initialize font upload form
     */
    initUploadForm() {
        // document.getElementById('fontUpload').addEventListener('submit', () => {
        //     this.ajaxFontUpload.start();
        // });
    };
    /* 
     * Upload font using ajax
     *
     */
    ajaxFontUpload = (function () {
        return {
            start: function () {
                hide(document.querySelector('.fontUploadForm'));
                show(document.querySelector('.fontUploading'));
                document.querySelector('#fontUploadIframe').addEventListener('load', () => {
                    this.loadPrivateFonts();
                    //get info about the upload
                    /*$.getJSON(this.config.FFW_baseUrl + '/font/wpaddsummary', function (data) {
                    if (data.success === 'true') {
                    this.loadPrivateFonts();
                    } else {
                    alert('Font upload error. Check if file is not blocked against embedding.');
                    $('.fontUploadForm').show();
                    $('.fontUploading').hide();
                    }
                    });*/
                });
            }
        };
    }());
}

function toFormData(obj) {
    return Object.keys(obj).reduce((formData, key) => {
        formData.append(key, obj[key]);
        return formData;
    }, new FormData());
}

function findDelegatedElement(source, selector) {
    if(source.matches(selector)) return source;
    if(source.parentElement && source.parentElement.matches(selector)) return source.parentElement;
}

function show(el) {
    if (Array.isArray(el) || el instanceof NodeList) {
        Array.prototype.forEach.call(el, ell => ell.style.display = 'block');
    } else if(el) {
        el.style.display = 'block';
    }
}

function hide(el) {
    if (Array.isArray(el) || el instanceof NodeList) {
        Array.prototype.forEach.call(el, ell => ell.style.display = 'none');
    } else if(el) {
        el.style.display = 'none';
    }
}




// ADD FOOTER AGAIN WHY NOT!




var isTyping = false;
var focusedInput = null;

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function ajaxPages(options) {

    var TITLE_SELECTOR = 'title';
    var BEG_TITLE_TAG = '<title>';
    var END_TITLE_TAG = '</title>';

    var defaults = {
        rootSelector: 'body',
        replaceSelector: '#content',
        searchSelector: '#content',
        loaderSelector: '#loadingContent',
        linkSelector: "a[data-link='ajax']",
        formSelector: "form[data-link='ajax']",
        paginationKey: "p",
        scrollTop: true,
        scrollTopSelector: '#content',
        scrollTopDuration: 500,
        enableAnalyticsTrack: true,
        enableUrlChange: true,
        changeTitle: true,
        titleSelector: "title",
        minLoadTime: 0,
        typingTimeout: 500,
        beforeLoading: function () {
        },
        afterLoading: function () {
        }
    };

    var opts = jQuery.extend(defaults, options);

    window.history.replaceState({
        "html": $(opts.searchSelector).html(),
        "pageTitle": document.title
    }, "", window.location.href);

    $(opts.loaderSelector).hide();

    function loadContent(url) {

        if (url === window.location.href) {
            return false;
        }

        opts.beforeLoading();
        $(opts.loaderSelector).fadeIn();

        var beg = new Date();

        //Send page to Google Analytics
        if (opts.enableAnalyticsTrack && typeof ga === "function") {
            ga('send', 'pageview', url);
        }

        $.get(url, function (data) {
            var then = new Date();
            var dif = then.getTime() - beg.getTime();
            var loadTime = opts.minLoadTime;

            if (dif >= opts.minLoadTime) {
                loadTime = 0;
            }
            else {
                loadTime = opts.minLoadTime - dif;
            }

            setTimeout(function () {
                body = '<div>' + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '') + '</div>';
                var $htmlData = $(body);

                $(opts.loaderSelector).fadeOut(function () {
                    $htmlData = $htmlData.find(opts.searchSelector).html();
                    $(opts.replaceSelector).html($htmlData);

                    opts.afterLoading();

                    if (opts.changeTitle) {
                        var newTitle = '';
                        if (opts.titleSelector == TITLE_SELECTOR) {
                            // In this case we need to capture the title inside the head tag
                            var begIndex = data.indexOf(BEG_TITLE_TAG) + BEG_TITLE_TAG.length;
                            var endIndex = data.indexOf(END_TITLE_TAG);
                            newTitle = data.substring(begIndex, endIndex);
                        }
                        else {
                            newTitle = $htmlData.find(opts.titleSelector).text();
                        }
                        document.title = newTitle;
                    }

                    if (opts.enableUrlChange) {
                        window.history.pushState({"html": $htmlData, "pageTitle": document.title}, "", url);
                    }

                    if (opts.scrollTop) {
                        $('html, body').animate({
                            scrollTop: $(opts.scrollTopSelector).offset().top
                        }, opts.scrollTopDuration);
                    }

                    if (focusedInput) {
                        input = $('input[name="' + focusedInput + '"]');
                        if (input.length === 1) {
                            input[0].focus();
                            var value = input.val();
                            input.val("").val(value);
                        }
                        focusedInput = null;
                    }

                    ajaxPages(options);
                });

            }, loadTime);
        });
    }

    function removeParameter(key, url) {
        var valRegex = new RegExp("([?&])" + key + "=.*?(&|#|$)", "g");
        return url.replaceAll(valRegex, '$1');
    }

    function removeValueParameter(key, value, url) {
        var valRegex = new RegExp("([?&])" + key + "=" + value + "(&|#|$)");
        return url.replace(valRegex, '$1');
    }

    function resolveFormParameter(key, val, url, separator) {
        if (val === "") {
            url = removeParameter(key, url);
        }
        else if (url.indexOf(key) !== -1 && key.indexOf("[]") === -1) {

            var valRegex = new RegExp('(' + key + '=)[^\&]+');
            url = url.replace(valRegex, '$1' + val);
        }
        else {
            url = url + separator + key + "=" + val;
        }

        return url;
    }

    window.onpopstate = function (e) {
        if (e.state) {
            $(opts.replaceSelector).html(e.state.html);
            document.title = e.state.pageTitle;

            //Send page to Google Analytics
            if (opts.enableAnalyticsTrack && typeof ga === "function") {
                ga('send', 'pageview', window.location.href);
            }

            ajaxPages(options);
        }
    };

    return $("html").find(opts.rootSelector).each(function (i, obj) {

        var $element = jQuery(obj);
        var $anchors = $element.find(opts.linkSelector).get();
        var $forms = $element.find(opts.formSelector).get();

        $.each($anchors, function (j, ele) {
            $(ele).attr('onclick', 'return false');
            $(ele).click(function (event) {
                var url = $(event.target).attr('href');
                loadContent(url);
            });
        });

        $.each($forms, function (j, ele) {
            $(ele).attr('submit', 'return false');
            var url = window.location.href;
            var separator = "?";

            if (url.indexOf("?") !== -1) {
                separator = "&";
            }

            $(ele).find("input, select").each(function () {

                $(this).on('input change', function () {
                    if (isTyping) {
                        clearTimeout(isTyping);
                    }

                    var key = $(this).attr("name");
                    var val = $(this).val();
                    var typingTimeout = 0;
                    focusedInput = key;

                    if ($(this).is("input[type='text']")) {
                        typingTimeout = opts.typingTimeout;
                    }

                    isTyping = setTimeout(function () {

                        url = removeParameter(opts.paginationKey, url);

                        if (key.indexOf("[]" !== -1)) {
                            url = removeParameter(key, url);

                            val =  $("input[name='" + key + "']:checked").each(function () {
                                url = resolveFormParameter(key, $(this).val(), url, separator);
                            });
                        }
                        else {
                            url = resolveFormParameter(key, val, url, separator);
                        }

                        url = url.replace('&&', '&');
                        url = url.replace('?&', '?');
                        url = url.replace(/([?&])$/, '');

                        loadContent(url);
                    }, typingTimeout);
                });
            })
        });
    });
}


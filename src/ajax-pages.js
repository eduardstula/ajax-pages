var isTyping = false;
var focusedInput = null;

function ajaxPages(options) {

    var TITLE_SELECTOR = 'title';
    var BEG_TITLE_TAG = '<title>';
    var END_TITLE_TAG = '</title>';

    var defaults = {
        rootSelector: 'body',
        replaceSelector: '#content',
        replaceMethod: 'replace',
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
        loadOnPopState: false,
        beforeLoading: function () {
        },
        afterLoading: function () {
        },
        onError: function () {
        }
    };

    var opts = jQuery.extend(defaults, options);

    window.history.replaceState({
        "html": $(opts.searchSelector).html(),
        "pageTitle": document.title
    }, "", window.location.href);

    $(opts.loaderSelector).hide();

    function loadContent(url) {

        opts.beforeLoading();
        $(opts.loaderSelector).fadeIn();

        var beg = new Date();

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

                if (opts.replaceMethod === "replace") {
                    var body = '<div>' + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '') + '</div>';
                    var $htmlData = $(body);
                    $htmlData = $htmlData.find(opts.searchSelector).html();

                    $(opts.replaceSelector).html($htmlData);
                }
                else if (opts.replaceMethod === "append") {
                    $(opts.replaceSelector).append(data);
                }

                $(opts.loaderSelector).fadeOut();

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
                    if (url !== window.location.href) {
                        window.history.pushState({"html": $htmlData, "pageTitle": document.title}, "", url);
                    }
                }

                if (opts.scrollTop) {
                    $('html, body').animate({
                        scrollTop: $(opts.scrollTopSelector).offset().top
                    }, opts.scrollTopDuration);
                }

                if (focusedInput) {
                    var input = $('input[name="' + focusedInput + '"]');
                    if (input.length === 1) {
                        input[0].focus();
                        var value = input.val();
                        input.val("").val(value);
                    }
                    focusedInput = null;
                }

                //Send page to Google Analytics
                if (opts.enableAnalyticsTrack && typeof ga === "function") {
                    ga('send', 'pageview', url);
                }

                opts.afterLoading();

                ajaxPages(options);

            }, loadTime);
        }).fail(function () {
            opts.onError();
            $(opts.loaderSelector).fadeOut();
        });
    }

    function removeParameter(key, url) {
        var valRegex = new RegExp("([?&])" + key + "=.*?(&|#|$)")
        return url.replace(valRegex, '$1');
    }

    window.onpopstate = function (e) {

        if (e.state) {
            if (opts.loadOnPopState) {
                loadContent(window.location.href);
                return true;
            }
            else if (typeof e.state.html !== "undefined") {
                $(opts.replaceSelector).html(e.state.html);

                if (opts.changeTitle) {
                    document.title = e.state.pageTitle;
                }

                //Send page to Google Analytics
                if (opts.enableAnalyticsTrack && typeof ga === "function") {
                    ga('send', 'pageview', window.location.href);
                }

                ajaxPages(options);
                return true;
            }
        }

        window.location.href = window.location.href;
    };

    return $("html").find(opts.rootSelector).each(function (i, obj) {

        var $element = jQuery(obj);
        var $anchors = $element.find(opts.linkSelector).get();
        var $forms = $element.find(opts.formSelector).get();

        $.each($anchors, function (j, ele) {
            $(ele).attr('onclick', 'return false');
            $(ele).off().click(function (event) {
                var element = $(event.target);
                for (i = 0; i < 10; i++) {
                    if(typeof element.attr("href") === "undefined") {
                        element = element.parent();
                    }
                    else {
                        break;
                    }
                }

                loadContent(element.attr('href'));
            });
        });

        $.each($forms, function (j, ele) {
            $(ele).attr('submit', 'return false');
            var url = window.location.href;
            var separator = "?";

            if (url.indexOf("?") !== -1) {
                separator = "&";
            }

            $(ele).find("input[type='text'], input[type='radio'], select").each(function () {

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

                        if (val === "") {
                            url = removeParameter(key, url);
                        }
                        else if (url.indexOf(key) !== -1) {

                            var valRegex = new RegExp('(' + key + '=)[^\&]+');
                            url = url.replace(valRegex, '$1' + val);
                        }
                        else {
                            url = url + separator + key + "=" + val;
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

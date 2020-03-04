$(document).ready(() => {

    let url = $(location).attr('pathname');
    let headline = $("#site-headline");
    let content = $("#site-content");
    let table = $(".table-wrapper");
    let navcontent = $(".navcontent");
    let pageDetails;
    let routes;


    $("head").append("<script>hljs.initHighlightingOnLoad();</script>");

    $.get('/details' + url, (data) => {
        pageDetails = data[0];
        $(document).attr("title", pageDetails.headline);
        headline.append(`<h2 id="headline-text">${pageDetails.headline}</h2>`);
        content.append(`<span id="content-text">${pageDetails.content}</span>`);
    })

    $.get('/routes', (data) => {
        routes = data;
        data.forEach(route => {
            navcontent.append(`<a href="/${route.url}">${route.headline}</a>`);
            table.append(`<span>${route.headline}</span><br>`)
        })
    })

    $("#save-button").click(() => {
        let pageTitle = $("#page-title");
        $.post('/newpage',
            { data: { headline: pageTitle.val() } },
            function (data, status, jqXHR) {
                console.log(data);
                navcontent.append(`<a href="/${data.headline.toLowerCase().split(' ').join('')}">${data.headline}</a>`);
                table.append(`<span>${data.headline}</span><br>`)
            })
    });

    $("#edit-button").click(() => {
        edit();
    });

    $("#delete-button").click(() => {
        deleteItem();
    });

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function edit() {
        $("#headline-text").remove();
        $("#content-text").remove();
        $("#edit-button").remove();
        $("#delete-button").remove();

        let button = document.createElement("button");
        button.id = "publish-button";
        button.textContent = "Publish";
        button.addEventListener("click", publish, false);

        headline.append(`<input type="text" id="headline-text" value="${pageDetails.headline}" />`);
        content.append(`<textarea id="editor1" name="editor1" rows="10" cols="80">
        ${escapeHtml(pageDetails.content)}
        </textarea><script>
        CKEDITOR.replace('editor1', { width: "100%", height: "600px", extraPlugins: 'codesnippet', codeSnippet_theme: 'idea' });
        </script>`);
        $(".headline-wrap").append(button);
    }

    function deleteItem() {
        $.ajax({ url: '/deletepage' + url, method: 'DELETE', data: {} })
            .then((res) => {
                let routesArray = [...routes];
                $(".navcontent").html('');
                let newRoutes = routesArray.filter(route => {
                    console.log(route, url);
                    if ('/' + route.url === url) {
                        return false;
                    } else {
                        return true;
                    }
                });
                newRoutes.forEach(route => {
                    $(".navcontent").append(`<a href="/${route.url}">${route.headline}</a>`);
                })
                $("#site-headline").empty();
                $("#site-content").remove();
                $("#button-wrap").empty();
                $(".dashboard-wrapper").append(`<h2 id="headline-text" style="text-align: center;">Page is now deleted! 👍</h2>`);
            })
    }

    function publish() {

        let editButton = document.createElement("button");
        editButton.id = "edit-button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", edit, false);

        let deleteButton = document.createElement("button");
        deleteButton.id = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", deleteItem, false);

        let body = CKEDITOR.instances['editor1'].getData();
        let headline = $("#headline-text").val();

        $.ajax({ url: '/editpage' + url, method: 'PUT', data: { body: body, headline: headline } })
            .then(response => {

                $("#headline-text").remove();
                $("#cke_editor1").remove();
                $("#editor1").remove();
                $("#publish-button").remove();

                $("#button-wrap").append(editButton);
                $("#button-wrap").append(deleteButton);

                $("#site-content").empty();
                $("#site-headline").append(`< h2 id = "headline-text" > ${response.headline}</h2 > `);

                $("#site-content").append(`< span id = "content-text" > ${response.content}</span > `);
                $(".language-php").class = "language-php hljs";
            })
    }
})
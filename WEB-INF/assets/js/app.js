(function ($) {

//////////////////////////////////////////////////////////////////////////////////////////
    // $(function() {
    //   var $fullText = $('.admin-fullText');
    //   $('#admin-fullscreen').on('click', function() {
    //     $.AMUI.fullscreen.toggle();
    //   });

    //   $(document).on($.AMUI.fullscreen.raw.fullscreenchange, function() {
    //     $.AMUI.fullscreen.isFullscreen ? $fullText.text('关闭全屏') : $fullText.text('开启全屏');
    //   });
    // });

///////////////////////////////////////////////////////////////////////////////////////////
    var loadPath = "http://localhost:5000/am";//serv
    var deletePath = "http://localhost:5000/am";
    var editPath = "http://localhost:5000/am";
    var addPath = "http://localhost:5000/am";
    var sort_rule = []
    var TStable = {
        init: function () {
            LoadDataGet();
        }
    };

    TStable.list = new Array();
    TStable.display_list = new Array();

    TStable.sel_list = new Array();

    function DATA(channel_id, channel_name, rtmp_url, client_ip, status) {
        this.channel_id = channel_id;
        this.channel_name = channel_name;
        this.rtmp_url = rtmp_url;
        this.client_ip = client_ip;
        this.state = status;
    }

    function SEL(channel_id, channel_name) {
        this.channel_id = channel_id;
        this.channel_name = channel_name;
    }

    var curPage = 1;

//get 方法同步
// $.ajaxSetup({  
//     async : false  
// }); 
    function setSortRule() {
        sort_rule = [];
        $("#table-body tr").each(function (index) {
            var tds = $(this).children();
            var channel_id = tds.eq(1).html();
            var obj = {
                "channel_id": channel_id,
                "id": index
            };
            sort_rule.push(obj);
        });
        $.get(loadPath, {"sort_rule": JSON.stringify(sort_rule)}, function (data) {
            if (data === 'Operate successed') {
                alert("Succeed!");
                LoadDataGet();
            } else {
                alert("Sort Failed!");
                LoadDataGet();
            }
        });
    }

//HTTP协议下使用，使用本站数据
    var LoadDataGet = function () {
        TStable.list = [];
        TStable.display_list = [];

        TStable.sel_list = [];
        // var sort_rule = [
        //     {
        //         "channel_id": "cctv3",
        //         "id": 2
        //     },
        //     {
        //         "channel_id": "cctv2",
        //         "id": 3
        //     },
        //     {
        //         "channel_id": "cctv1",
        //         "id": 1
        //     }
        // ];

        $.get(loadPath, {op: "category"}, function (data) {
            //alert(String(data));
            var parsedJson = jQuery.parseJSON(data);
            //alert(parsedJson.users);
            $.each(parsedJson.category, function (idx, item) {
                //alert(item.username);

                TStable.list.push(new DATA(item.channel_id, item.channel_name, item.rtmp_url, item.client_ip, item.st));

            });
            $.each(parsedJson.sel, function (idx, item) {
                //alert(item.username);

                TStable.sel_list.push(new SEL(item.channel_id, item.channel_name));

            });


            var status_temp;

            //alert(TStable.list.length);
            for (var i = 0; i < TStable.list.length; i++) {
                if (TStable.list[i].state == 1) {
                    status_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger bt-status"><span class="am-icon-stop"></span> </button>已运行';
                } else if (TStable.list[i].state == 0) {
                    status_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-play"></span> </button>未运行';
                } else if (TStable.list[i].state == 2) {
                    status_temp = '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>';
                }

                //var t = TStable.list[i].username;
                //var temp = t;//t.substr(0,2) + '-' + t.substr(2,2) + '-' + t.substr(4,2) + '-' + t.substr(6,2) + '-' + t.substr(8,2) + '-' + t.substr(10,2);
                TStable.display_list[i] = $('<tr id="' + TStable.list[i].channel_id + '">' +
                    '<td>' + (i + 1) + '</td>' +
                    '<td>' + TStable.list[i].channel_id + '</td>' +
                    '<td>' + TStable.list[i].channel_name + '</td>' +
                    '<td>' + TStable.list[i].rtmp_url + '</td>' +
                    '<td>' + TStable.list[i].client_ip + '</td>' +
                    '<td>' +
                    '<div class="am-btn-toolbar">' +
                    '<div class="am-btn-group am-btn-group-xs" >' +
                    '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-edit"><span class="am-icon-pencil-square-o"></span> Edit</button>' +
                    '<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger am-hide-sm-only bt-delete"><span class="am-icon-trash-o"></span> Delete</button>' +
                    '</div></div></td>' +
                    '<td> ' +
                    status_temp +
                    '</td>' +
                    '<td></td>' +
                    '</tr>'
                );
                TStable.display_list[i].find('.bt-delete').click(deleteClick);
                TStable.display_list[i].find('.bt-edit').click(editClick);
                TStable.display_list[i].find('.bt-status').click(statusClick);
            }

            //maxPage = Math.ceil(TStable.list.length/Num);

            display();
            setBottom();
        });
    };

//每页显示信息条数
    var Num = 10;
    var maxPage = 0;

    function display() {
        //curPage = page;

        $('tbody').find('tr').detach();
        var t = TStable.list.length;
        for (var i = 0; i < t; i++) {
            $('tbody').append(TStable.display_list[i]);
        }

        // setPagination(page);
        setBottom();

    }

    TStable.display1 = function (page) {
        display(page);
    }

    function setBottom() {

        $("#bottom").text('共 ' + TStable.list.length + ' 条记录');
    }

    function setPagination(page) {
        //remove
        //$(".am-pagination").find("li").remove();
        $(".am-pagination").html("");

        $(".am-pagination").append('<li><a class="am-icon-angle-double-left" href="#" onclick="TStable.display1(1)"></a></li>');

        if (page == 1) {
            $(".am-pagination").append('<li class="am-disabled"><a class="am-icon-angle-left" href="#" onclick="TStable.display1(' + (page - 1) + ')"></a></li>');
        } else {
            $(".am-pagination").append('<li><a class="am-icon-angle-left" href="#" onclick="TStable.display1(' + (page - 1) + ')"></a></li>');
        }

        console.log(maxPage);
        if (maxPage < 3.1) {

            for (i = 0; i < maxPage; i++) {
                $(".am-pagination").append('<li id="page-' + (i + 1) + '"><a href="#" onclick="TStable.display1(' + (i + 1) + ')">' + (i + 1) + '</a></li>');
            }

            $("#page-" + (page)).addClass("am-active");

        } else {
            var temp1 = page;
            var temp;
            if (page < 3) {
                temp = 1;
            } else if (page > maxPage - 3) {
                temp = maxPage - 2;
            } else temp = temp1 - 1;

            console.log("temp:" + temp);

            for (var i = temp - 1; i < temp + 2; i++) {
                $(".am-pagination").append('<li id="page-' + (i + 1) + '"><a href="#" onclick="TStable.display1(' + (i + 1) + ')">' + (i + 1) + '</a></li>');
            }

            $("#page-" + (page)).addClass("am-active");

        }

        if (page == maxPage) {
            $(".am-pagination").append('<li class="am-disabled"><a class="am-icon-angle-right" href="#" onclick="TStable.display1(' + (page + 1) + ')"></a></li>');
        } else {
            $(".am-pagination").append('<li><a class="am-icon-angle-right" href="#" onclick="TStable.display1(' + (page + 1) + ')"></a></li>');
        }

        $(".am-pagination").append('<li><a class="am-icon-angle-double-right" href="#" onclick="TStable.display1(' + maxPage + ')"></a></li>');

        $(".am-pagination").append('  ' + ((curPage - 1) * 10 + 1) + '~' + (TStable.list.length < ((curPage - 1) * 10 + 10) ? TStable.list.length : ((curPage - 1) * 10 + 10)) + ' of ' + TStable.list.length + ' items');

    }

//搜索
    TStable.search = function (inputString) {
        if (inputString == '') {
            //alert('null!');
            display(curPage);
        } else {
            inputString = inputString.replace(/\-/g, '');
            console.log(inputString);
            //alert('not null!');
            var reg = new RegExp(inputString.toLowerCase());
            //alert('name:'+TStable.list[0].username + '   test:'+ reg.test(TStable.list[0].username.toLowerCase()));

            $('tbody').find('tr').detach();
            for (var i = 0; i < TStable.list.length; i++) {
                if (reg.test(TStable.list[i].username.toLowerCase())) {
                    $('tbody').append(TStable.display_list[i]);
                }
                //$(".am-text-danger").click(deleteClick);

                //remove
                $("#bottom").text('');
                $(".am-pagination").html("");
            }
        }

    }

    function deleteClick() {

        $('#my-confirm').modal({
            relatedTarget: this,
            onConfirm: function (options) {
                //var $link = $(this.relatedTarget).prev('a');
                var name = $(this.relatedTarget).parents("td").prev().prev().prev().prev().text();
                //alert("delete: "+name);
                DeleteOneData(name);
            },
            // closeOnConfirm: false,
            onCancel: function () {
                //alert('Cancel');
            }
        });
    }


    var DeleteOneData = function (channel_id) {
        //alert("delete:"+ TStable.list[id-1].username);
        $.get(deletePath, {op: "delete", id: channel_id},
            function (data) {
                if (data == 'Operate successed') {
                    alert("Succeed!");
                    LoadDataGet();
                    return;
                } else if (data == 'Invalid Request') {
                    alert("Failed!");
                    LoadDataGet();
                    return;
                }
            });

    }

    function statusClick() {
        var channel_id = $(this).parents("td").prev().prev().prev().prev().prev().text();
        var client_ip = $(this).parents("td").prev().prev().text();
        console.log(channel_id);
        console.log($(this).html());

        console.log($(this).parents("td").text());
        console.log($(this).parents("td").text().indexOf("已运行"));

        var operate;

        if ($(this).parents("td").text().indexOf("已运行") != -1) {
            operate = 1;
        } else {
            operate = 0;
        }

// $(this).html('<span class="am-icon-spinner am-icon-spin"></span>');

        var temp = $(this).parents("td");
        //$(this).parents("td").html("停止");
        temp.html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>');
        $.get(deletePath, {op: "status", id: channel_id, s: operate, ip: client_ip},
            function (data) {
                if (data == 'Operate successed') {
                    // alert("Succeed!");

                    if (operate == 1) {
                        temp.html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>');
                    } else {
                        temp.html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>');
                    }


                    // LoadDataGet();
                    return;
                } else if (data == 'Invalid Request') {
                    // alert("Failed!");

                    // console.log(temp);

                    // if(operate == 1)
                    // {
                    //     temp.html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-stop"></span> </button>运行');
                    // }else{
                    //     temp.html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-play"></span> </button>停止');
                    // }

                    // LoadDataGet();

                    return;
                } else {
                    temp.html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>');
                }
            });


    }

    TStable.deleteAllData = function (users) {
        $.post(deletePath, {op: "deleteall", mac: users.toString()},
            function (data) {
                if (data == 'Operate successed') {
                    alert("Succeed!");
                    LoadDataGet();
                    return;
                } else if (data == 'Invalid Request') {
                    alert("Failed!");
                    LoadDataGet();
                    return;
                }
            });
    }

    function editClick() {
        var name = $(this).parents("td").prev().prev().prev().prev().text();
        var password = $(this).parents("td").prev().prev().prev().text();
        var total = $(this).parents("td").prev().prev().text();
        var client_ip = $(this).parents("td").prev().text();
        $("#edit-prompt").find("#prompt-user").val(name);
        $("#edit-prompt").find("#prompt-password").val(password);
        $("#edit-prompt").find("#prompt-total").val(total);
        $("#edit-prompt").find("#prompt-ip").val(client_ip);
        $("#edit-prompt").modal({
            relatedTarget: this,
            onConfirm: function (e) {
                //alert('你输入的是：' + e.data[1] || '');

                if (e.data[1] == "" || e.data[2] == "" || e.data[3] == "") {
                    alert("编辑失败！" + e.data[1] + '  ' + e.data[2] + '  ' + e.data[3]);
                } else {
                    editData(e.data[0], e.data[1], e.data[2], e.data[3]);
                }

            },
            onCancel: function (e) {
                //alert('不想说!');
            }
        });
    }

    function editData(channel_id, channel_name, rtmp_url, client_ip) {
        //name = name.replace(/\-/g,'');
        $.get(editPath, {op: "edit", id: channel_id, name: channel_name, url: rtmp_url, ip: client_ip},
            function (data) {
                if (data == 'Operate successed') {
                    alert("Succeed!");
                    LoadDataGet();
                    return;
                } else if (data == 'Invalid Request') {
                    alert("Failed!");
                    LoadDataGet();
                    return;
                }
            });
    }

    TStable.addData = function (channel_id, channel_name, url, client_ip) {
        //username = username.replace(/\-/g,'');
        $.get(addPath, {op: "add", id: channel_id, name: channel_name, url: url, ip: client_ip},
            function (data) {
                if (data == 'Operate successed') {
                    alert("Succeed!");
                    LoadDataGet();
                    return;
                } else if (data == 'Invalid Request') {
                    alert("Failed!");
                    LoadDataGet();
                    return;
                } else if (data == 'exist') {
                    alert("already exist!");
                    LoadDataGet();
                    return;
                }
            });

    }
    TStable.insertData = function (channel_id, channel_name, url, client_ip) {
        //username = username.replace(/\-/g,'');
        $.get(addPath, {op: "insert", id: channel_id, name: channel_name, url: url, ip: client_ip},
            function (data) {
                if (data === 'Operate successed') {
                    alert("Succeed!");
                    LoadDataGet();
                } else if (data === 'Invalid Request') {
                    alert("Failed!");
                    LoadDataGet();
                } else if (data === 'exist') {
                    alert("already exist!");
                    LoadDataGet();
                }
            });

    }

    TStable.fresh = function () {
        //console.log("inside call");
        var temp_list = [];

        $.get(loadPath, {op: "category"}, function (data) {
            //alert(String(data));
            var parsedJson = jQuery.parseJSON(data);
            //alert(parsedJson.users);
            $.each(parsedJson.category, function (idx, item) {
                //alert(item.username);

                temp_list.push(new DATA(item.channel_id, item.channel_name, item.rtmp_url, item.client_ip, item.st));

            });

            for (var i = 0; i < temp_list.length; i++) {
                if (temp_list[i].channel_id == TStable.list[i].channel_id) {
                    //console.log('true');
//          if(  temp_list[i].state != 2)
//          {

                    var t = $("#" + temp_list[i].channel_id);
                    if (temp_list[i].state == 2) {
                        t.children().last().prev().html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>');
                    } else if (temp_list[i].state == 0) {
                        t.children().last().prev().html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-play"></span> </button>未运行');
                        t.find('.bt-status').click(statusClick);

                    } else if (temp_list[i].state == 1) {
                        t.children().last().prev().html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-danger bt-status"><span class="am-icon-stop"></span> </button>已运行');
                        t.find('.bt-status').click(statusClick);
                    } else {
                        t.children().last().prev().html('<button type="button" class="am-btn am-btn-default am-btn-xs am-text-secondary bt-status"><span class="am-icon-spinner am-icon-spin"></span> </button>');
                    }

//          }
                }
            }

            //console.log(temp_list[i].channel_id + '  '+ TStable.list[i].channel_id);

        });


        for (var i = 0; i < TStable.list.length; i++) {

            var client_ip;
            if (TStable.list[i].client_ip.indexOf(":") == -1) {
                client_ip = TStable.list[i].client_ip;

            } else {
                var client_ip = TStable.list[i].client_ip.substr(0, TStable.list[i].client_ip.indexOf(":"));
            }


            var replay_url = 'http://' + client_ip + ':9999/status/' + TStable.list[i].channel_id;

            // $.get(replay_url,function(data){
            //   console.log('get  ' + replay_url)
            //   var t = $("#" + TStable.list[i].channel_id);
            //   t.children().last().html(data);

            // });
            getStatus(replay_url, TStable.list[i].channel_id);

        }


    }


    function getStatus(url, id) {

        $.get(url, function (data, status) {
            //console.log('get  ' + url)
            var t = $("#" + id);
            // console.log(status)
            if (status == "success") {
                t.children().last().html(data);
            } else {
                t.children().last().html("");
            }

        });

    }


//绑定全局变量
    window.TStable = TStable;
    $(function () {
        $("#sort-btn").click(setSortRule);
        $("#insert-btn").click(function (event) {
            console.log("click insert");
            $("#insert-prompt").find("#insert-prompt-id").html("");

            $("#insert-prompt").find("#insert-prompt-name").val("");
            $("#insert-prompt").find("#insert-prompt-url").val("");
            $("#insert-prompt").find("#insert-prompt-ip").val("");

            $("#insert-prompt").modal({
                relatedTarget: this,
                onConfirm: function (e) {
                    //alert('你输入的是：' + e.data || '');
                    if (e.data[0] === "" || e.data[1] === "" || e.data[2] === "" || e.data[3] === "") {
                        alert("添加失败");
                    } else {
                        TStable.insertData(e.data[0], e.data[1], e.data[2], e.data[3]);
                    }

                },
                onCancel: function (e) {
                    //alert('不想说!');
                }
            });

        });
    })
})(jQuery);

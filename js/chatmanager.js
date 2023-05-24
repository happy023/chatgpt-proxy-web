import * as common from "./common.js";
import * as chat from './chat.js';
import { mdHtml } from "./markdown.js";

export function updateHistory(contextarray) {
    if (!chat.getContextId()) {
        throw new Error('发送错误，没有初始化聊天上下文');
    }
    let talkData = JSON.parse(localStorage.getItem('talkData') || '[]');
    let currIndex = null;
    for (let i = 0; i < talkData.length; i++) {
        const talkItem = talkData[i];
        if (talkItem.contextId === chat.getContextId()) {
            currIndex = i;
            break;
        }
    }
    if (currIndex === null) {
        currIndex = talkData.length;
        talkData[currIndex] = {};
    }
    let talkTime = (new Date(new Date().getTime() + 1000 * 60 * 60 * 8)).toISOString();
    talkTime = talkTime.substring(0, 19).replace('T', ' ');
    talkData[currIndex].contextId = chat.getContextId();
    talkData[currIndex].contextarray = contextarray;
    talkData[currIndex].talkTime = talkTime;
    localStorage.setItem('talkData', JSON.stringify(talkData));

    //界面历史记录栏更新
    let talkDiv = $('#' + chat.getContextId());
    let talkSize = contextarray.length;
    let prompt = contextarray[0][0];
    const contextId = chat.getContextId();
    if (talkDiv.length === 0) {
        $('#talk-history-content').append(`
            <div class="talk-history-item talk-history-item-selected" id="` + chat.getContextId() + `">
                <div>
                    <div class="talk-history-title">` + prompt + `</div>
                    <div class="talk-history-time">
                        <span>`+ talkSize + `条对话</span>
                        <span>`+ talkTime + `</span>
                    </div>
                </div>
            </div>
        `);
        (function (contextId) {
            $('#' + contextId).click(() => loadTalkContext(contextId));
        })(contextId);
        //选中当前项
        selectTalkRecord(contextId);
    } else {
        $('#' + contextId + '>div>.talk-history-title').text(prompt);
        $('#' + contextId + '>div>.talk-history-time')
            .html('<span>' + talkSize + '条对话</span><span>' + talkTime + '</span>');
    }
}

export function loadTalkList() {
    let talkData = JSON.parse(localStorage.getItem('talkData') || '[]');
    for (let i = 0; i < talkData.length; i++) {
        const talkItem = talkData[i];

        const contextId = talkItem.contextId;
        const prompt = talkItem.contextarray[0][0];
        const talkSize = talkItem.contextarray.length;
        const talkTime = talkItem.talkTime;

        $('#talk-history-content').append(`
            <div class="talk-history-item" id="` + contextId + `"> 
                <div>
                    <div class="talk-history-title">` + prompt + `</div>
                    <div class="talk-history-time">
                        <span>`+ talkSize + `条对话</span>
                        <span>`+ talkTime + `</span>
                    </div>
                </div>
            </div>
        `);

        (function (contextId) {
            $('#' + contextId).click(() => loadTalkContext(contextId));
        })(contextId);
    }
}

function loadTalkContext(ctxId) {
    let talkData = JSON.parse(localStorage.getItem('talkData') || '[]');
    let selectedItem = null;
    for (let i = 0; i < talkData.length; i++) {
        const talkItem = talkData[i];
        if (talkItem.contextId == ctxId) {
            selectedItem = talkItem;
            break;
        }
    }
    if (selectedItem) {
        //更新全局变量
        chat.setContextId(ctxId);
        chat.setContextarray(selectedItem.contextarray);
        //清除界面聊天内容
        $("#article-wrapper").html("");

        //选中当前项
        selectTalkRecord(ctxId);

        let items = chat.getContextarray();
        for (let i = 0; i < items.length; i++) {
            let prompt = items[i][0];
            let answer = items[i][1];

            let talkId = common.randomString(16);
            //问题
            $("#article-wrapper").append('<li class="article-title" id="q' + talkId + '"><pre></pre></li>');
            for (var j = 0; j < prompt.length; j++) {
                $("#q" + talkId).children('pre').text($("#q" + talkId).children('pre').text() + prompt[j]);
            }
            //答案
            $("#article-wrapper").append('<li class="article-content" id="' + talkId + '"></li>');
            answer = mdHtml.render(answer);
            $("#" + talkId).html(answer);
        }
    }
}

function deselectAllRecords() {
    $('.talk-history-item').each((_, item) => {
        $(item).removeClass('talk-history-item-selected');
    });
}

function selectTalkRecord(id) {
    deselectAllRecords();
    $('#' + id).addClass('talk-history-item-selected');
}

export function newTalk() {
    $("#article-wrapper").html("");
    chat.setContextarray([]);
    chat.setContextId('talk-' + common.randomString());
    deselectAllRecords();
}
console.log(`this is a popup`)

let currentTabs = []
let currentTabsIds = []
let tabDropdown;
let rabbitholeStatus = document.getElementById('status')
let warning = document.getElementById('warning').style
let start = document.getElementById('start').style

function updateTabList() {
    tabDropdown = document.getElementById('tabs')
    while (tabDropdown.firstChild !== null) {
        tabDropdown.removeChild(tabDropdown.lastChild)
    }
    for (let i=0; i<currentTabs.length; i++) {
        let tab = document.createElement("option")
        tab.innerHTML = currentTabs[i]
        tab.value = currentTabs[i]
        tabDropdown.appendChild(tab)
    }
}

chrome.tabs.query({}, function(tabs) {
    for (let i=0; i<tabs.length; i++) {
            currentTabs.push(tabs[i].title)
            currentTabsIds.push(tabs[i].id)
    }
    console.log(currentTabs)
    updateTabList()
    })

chrome.tabs.onCreated.addListener((tab) => {
    currentTabs.push(tab.title)
    currentTabsIds.push(tab.id)
    console.log(currentTabs)
    updateTabList()
})

chrome.tabs.onRemoved.addListener(function(tabId) {
    for (let i=0; i<currentTabs.length; i++) {
        if(currentTabsIds[i] == tabId) {
            currentTabs.splice(i, 1)
            currentTabsIds.splice(i, 1)
        }
    }
    console.log(currentTabs)
    updateTabList()
})

chrome.tabs.onUpdated.addListener((tab) => {
    for (let i=0; i<currentTabs.length; i++) {
        if(currentTabsIds[i] == tab.id) {
            currentTabs[i] = tab.title
        }
    }
    console.log(currentTabs)
    updateTabList()
})
function startBreak() {
    let selectedTab = tabDropdown.value
    let selectedTabId = currentTabsIds[currentTabs.indexOf(selectedTab)]
    let breakLength = document.getElementById('length').value
    chrome.runtime.sendMessage(
        {
            message: "startBreak",
            selectedTab: selectedTab,
            selectedTabId: selectedTabId,
            duration: breakLength,
            currentTabs: currentTabs,
            currentTabsIds: currentTabsIds
        },
        function(response) {
            if (response && response.status === "error") {
                warning.opacity = 1
                start.opacity = 0
            } else {
                rabbitholeStatus.innerText = "In a rabbithole"
                warning.opacity = 0
                start.opacity = 1
                setTimeout(() => { window.close(); }, 500);
            }
        }
    )
}

document.getElementById('start').addEventListener('click', function() {
    if(document.getElementById('length').value > 0) {
        startBreak()
    } else {
        console.log(`type in a duration`)
    }
})

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message === "popupOpened") {
            rabbitholeStatus.innerText = "In a rabbithole"
            warning.opacity = 1
            start.opacity = 0

        }
        if(request.message === "buttonPressed") {
            rabbitholeStatus.innerText = "Not in a rabbithole"
            warning.opacity = 0
            start.opacity = 1
        }
    }
)

chrome.runtime.sendMessage({message: "getBreakStatus"}, function(response) {
    if (response && response.inRabbithole) {
        rabbitholeStatus.innerText = "In a rabbithole"
        warning.opacity = 1
        start.opacity = 0

    } else {
        rabbitholeStatus.innerText = "Not in a rabbithole"
        warning.opacity = 0
        start.opacity = 1

    }
})
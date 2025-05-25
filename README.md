# The structure of localstorage should be like

{
    "omnirecall" : {
        user : {}
        settings : {
            "auto_redirect": false,
            "history_limit": 10
        }
        exclusion_list : {
            "domain.com": true
        }
        history: {
            "domain.com": [
                "webpage1"
            ],
        }
    }
}
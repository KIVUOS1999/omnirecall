const OmniRecall = "omnirecall"
const User = "user"
const Settings = "settings"
const ExclusionList = "exclusion_list"
const History = "history"

const OmniRecallStruct = {
  user: {},
  settings: {
    history_limit: 10 // Default history limit
  },
  exclusion_list: {},
  history: {}
}

export {
  OmniRecall,
  User,
  Settings,
  ExclusionList,
  History,
  OmniRecallStruct
};
// Frontend specific variables

const VALUE_TO_MAX_OUT_AT = 10;
let IS_DISPLAYING_SHORT_TABLE = true;
let ALL_FILES = [];
let IS_SHOWING_ADVANCED_MENU = false;
let CURRENT_LIBRARY_FOLDER = null;
let IS_DETECTED_EARTHQUAKE_FILE = false;
let IS_NIGHT_ON = false;
let IS_DISPLAYING_ITEM = false;
let IS_LOADING_ENTIRE_TABLE = false;
let CURRENT_RESULT = null;
let THIS_CURRENT_CHART = null;
let FIRST_DATE_OF_THIS_TABLE = null;
let LAST_DATE_OF_THIS_TABLE = null;
let CURRENT_VIEWING_TYPE = null;

const DATE_TYPE_HEADERS_FOR_LOOKUP = [
  "date",
  "date_time"
];

const ALL_NON_LINKING_HEADERS = [
    "date_time",
    "date",
    "site_id",
    "name",
    "latitude",
    "station",
    "longitude",
    "side_latitude",
    "site_longitude",
    "notes",
    "sample_id",
    "date_time_sampled",
    "date_analysed",
    "province",
    "time_zone",
    "start_time",
    "end_time"
];

function formatDate (date) {
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let processedDate = date.split(" ");
    let day = processedDate[2];
    let month = months.indexOf(processedDate[1]) + 1;
    if (month < 10) {
        month = '0' + month.toString();
    } else {
        month = month.toString();
    }
    let year = processedDate[3];
    let time_list = processedDate[4].split(':');
    let time = time_list[0] + ':' + time_list[1];

    return day + '/' + month + '/' + year + ', ' + time;
}

export default {
    formatDate
}
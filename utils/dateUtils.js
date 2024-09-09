let months = [
    'Janurary',
    'Februrary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];


export const formatDate = (date) => {
    // console.log(date);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    seconds: "numeric",
  };
  let ret = new Date(date).toLocaleDateString("en-US", options);

  if(ret.includes("Invalid Date")){
    var parts = date.slice(0,10).split("-");
    let ot = months[parseInt(parts[1]) - 1] + ' ' + (parseInt(parts[2])) + ', ' + parts[0];
    let time = date.slice(11,15);
    ot = ot + ', ' + time + ' AM';
    // console.log(time);
    // console.log(ot);
    return ot;
  }
  return ret;
};

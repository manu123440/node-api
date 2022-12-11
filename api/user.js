const express = require("express");
const request = require("request-promise");

const session = require("express-session");
const cookieParser = require("cookie-parser");

const catchAsync = require("../utils/catchAsync");

const router = express.Router();

router.use(cookieParser());

router.use(
  session({
    secret: "Your_key",
    resave: true,
    saveUninitialized: true
  })
);

router.get("/", catchAsync(async (req, res, next) => {
    try {
      res.render("./login", { docTitle: "Login" });
    }
    catch(error) {
      console.log('login', error);
    }
  })
);

router.get("/user/register", catchAsync(async (req, res, next) => {
    try {
      res.render("./register", { docTitle: "Register" });
    }
    catch(error) {
      console.log('register', error);
    }
  })
);

router.get("/user/forgetPsword", catchAsync(async (req, res, next) => {
    try {
      res.render("./forgetPassword", { docTitle: "Forget Password" });
    }
    catch(error) {
      console.log('forgetPassword', error);
    }
  })
);

let selectFunction = (item) => {
  var options = {
    method: "POST",
    url: "https://cash4.fun/connection/secure/api/cash4app/select.php",
    formData: {
      select_query: item,
    },
  };
  return options;
};

let insertFunction = (item, item2) => {
  let options = {
    method: "POST",
    url: "https://cash4.fun/connection/secure/api/cash4app/insert.php",
    formData: {
      insert_query: item,
      select_query: item2,
    },
  };
  return options;
};

let updateFunction = (item, item2) => {
  var options = {
    method: "POST",
    url: "https://cash4.fun/connection/secure/api/cash4app/update.php",
    formData: {
      update_query: item,
      select_query: item2,
    },
  };
  return options;
};

let updateRefer = () => {
  let email = req.session.name;
  // console.log(email);
  let opt18 = updateFunction(
    "update referrals set status = 'paid' where email = '"
      .concat(`${email}`)
      .concat("'"),
    "select * from referrals where email = '"
      .concat(`${email}`)
      .concat("'")
  );

  request(opt18, (error, response) => {
    if (error) throw new Error(error);
    else {
      let r6 = JSON.parse(response.body);
      // console.log(r6);
    }
  });
}

let updateBalance = (depositedAmount, percentage, email) => {
  let opt17 = selectFunction(
    "select main_balance from account_info where email = '"
      .concat(`${email}`)
      .concat("'")
  );

  request(opt17, (error, response) => {
    if (error) throw new Error(error);
    else {
      let r5 = JSON.parse(response.body);
      let referAmt = (parseFloat(depositedAmount) * parseFloat(percentage)) / 100;
      // console.log(referAmt);
      let mb = parseFloat(r5['1'].main_balance);
      mb += referAmt;
      // console.log(mb);

      let opt5 = updateFunction(
        "update account_info set main_balance = '"
            .concat(`${mb}`)
            .concat("' where email = '")
            .concat(`${email}`)
            .concat("'"),
        "select * from account_info where email = '"
            .concat(`${email}`)
            .concat("'")
      );
    
      request(opt5, (error, response) => {
        if (error) throw new Error(error);
        else {
          let r3 = JSON.parse(response.body);
          // console.log(r3);

          for (let i = 0; i < r3.length; i++) {
            if (r3[i] == null) continue;
            if (percentage == '10') {
              // console.log('first');
              referred(email, '3', 'false', depositedAmount);
            }
            else if (percentage == '3') {
              // console.log('second');
              referred(email, '2', 'false', depositedAmount);
            }
            else {
              // console.log('update');
              updateRefer();
            }
          }
        }
      })
    }
  })
}

let referred = (email, percentage, checkStatus, depositedAmount) => {
  let opt16 = selectFunction(
    "select * from referrals where referred_user = '"
      .concat(`${email}`)
      .concat("'")
  );

  request(opt16, (error, response) => {
    if (error) throw new Error(error);
    else {
      let r4 = JSON.parse(response.body);
      // console.log(r4);

      for (let i = 0; i < r4.length; i++) {
        if (r4[i] == null) continue;
        if (r4[i].isReferredUserValid == 'true') {
          if (checkStatus) {
            let ownerI = r4[i].owner;
            // console.log(ownerI);
            if (r4[i].status == 'unpaid') {
              updateBalance(depositedAmount, percentage, ownerI);
            }
          }
          else {
            updateBalance(depositedAmount, percentage, ownerI);
          }
        }
      }
    }
  });
}

router.get("/user/home", catchAsync(async (req, res, next) => {
  let email = req.session.name;

      let options = selectFunction(
        "select * from account_info where email = '".concat(`${email}`).concat("'")
      );

      request(options, function (error, response) {
        if (error) throw new Error(error);
        else {
          let x = JSON.parse(response.body);
          let today = new Date();
          let dt = String(today.getDate()).padStart(2, "0");
          let mt = String(today.getMonth() + 1).padStart(2, "0");
          let yt = today.getFullYear();

          today = dt + "/" + mt + "/" + yt;
          // console.log(x['1']);

          let opt1 = selectFunction(
            "select * from levels where level_status = 'active'"
          );

          request(opt1, function (error, response) {
            if (error) throw new Error(error);
            let y = JSON.parse(response.body);
            // console.log(y);

            let opt2 = selectFunction(
              "select * from machine_profit where email = '"
                .concat(`${email}`)
                .concat("'")
            );
            request(opt2, function (error, response) {
              if (error) throw new Error(error);
              else {
                let z = JSON.parse(response.body);
                // console.log(z);
                let st = z["1"].status;
                let cl = z["1"]["current_level"];
                let co = z['1']["date"];
                let mb = parseFloat(x["1"].main_balance);

                let opt3 = selectFunction(
                  "select * from deposits where email = '"
                    .concat(`${email}`)
                    .concat("'")
                );

                try {
                  request(opt3, (error, response) => {
                      if (error) throw new Error(error);
                      else {
                          let k = JSON.parse(response.body);
                          // console.log(k);
                          for (let i = 1; i < k.length; i++) {
                              if (k[i].status == "approved") {
                                  let id = k[i].id;
                                  let amt = String(k[i].amount.replace('$',''));
                                  mb += parseFloat(amt);
                                  // console.log(mb, amt);
                                  
                                  referred(email, '10', 'true', amt);

                                  let opt4 = updateFunction(
                                    "update deposits set status = 'added' where id = '"
                                        .concat(`${id}`)
                                        .concat("'"),
                                    "null"
                                  );
                                  request(opt4, (error, response) => {
                                    if (error) throw new Error(error);
                                    else {
                                      let opt5 = updateFunction(
                                        "update account_info set main_balance = '"
                                            .concat(`${mb}`)
                                            .concat("' where email = '")
                                            .concat(`${email}`)
                                            .concat("'"),
                                        "select * from account_info where email = '"
                                            .concat(`${email}`)
                                            .concat("'")
                                      );

                                      request(opt5, (error, response) => {
                                        if (error) throw new Error(error);
                                        else {
                                          let r3 = JSON.parse(response.body);
                                          // console.log(r3);
                                        }
                                      })
                                    }
                                  });
                              }
                          }
                      }
                  });

                  let opt15 = selectFunction(
                    "select * from account_info where email = '".concat(`${email}`).concat("'")
                  );

                  request(opt15, (error, response) => {
                    if (error) throw new Error(error);
                    else {
                      let m1 = JSON.parse(response.body);
                      // console.log(m1);
                      let opt6 = selectFunction(
                        "select * from product_earnings where email = '"
                            .concat(`${email}`)
                            .concat("'")
                      );
                      request(opt6, (error, response) => {
                        if (error) throw new Error(error);
                        else {
                          let k1 = JSON.parse(response.body);
                          // console.log(k1);
                          // let pi = 0; let ti = 0; let mb = 0;
                          let opt7 = selectFunction(
                            "select * from account_info where email = '"
                                .concat(`${email}`)
                                .concat("'")
                          );
                          request(opt7, (error, response) => {
                            if (error) throw new Error(error);
                            else {
                              let k2 = JSON.parse(response.body);
                              // console.log(k2);

                              let pi = parseFloat(k2["1"].product_income); 
                              let ti = parseFloat(k2["1"].today_income);
                              let tti = parseFloat(k2["1"].total_income); 
                              let mb = parseFloat(k2["1"].main_balance);
                              // console.log(pi, ti, tti, mb);

                              for (let i = 1; i < k1.length; i++) {
                                // console.log(k1[i]);
                                let kSplit = k1[i].expire_date.split('/');
                                let kDate = `'${kSplit[2]}-${kSplit[1]}-${kSplit[0]}'`;
                                let kExpired = new Date(kDate).getTime();
                                let kToday = new Date().getTime();

                                // let kSplit2 = k1[i].collected_on.split('/');
                                // let kDate2 = `'${kSplit2[2]}-${kSplit2[1]}-${kSplit2[0]}'`;
                                // let kCollectedOn = new Date(kDate2).getTime();

                                // console.log(k1[i].collected_on !== today, kExpired >= kToday);
                                // console.log(kExpired < kToday, kExpired, kToday, kDate);
                                if (
                                      k1[i].product_id !== "null" &&
                                      k1[i].status == "active" &&
                                      k1[i].collected_on !== today &&
                                      kExpired >= kToday
                                  ) {
                                      let interest =
                                      parseFloat(k1[i].min_invest) / 100 *
                                      (parseFloat(k1[i].daily_rate));

                                      pi += interest;
                                      ti += interest;
                                      tti += interest;
                                      mb += interest;
                                      // console.log("collected on");

                                      // console.log(typeof interest, interest, pi, ti, tti, mb);
                                                                  
                                      let pid = k1[i]._id;
                                      let opt9 = updateFunction(
                                        "update product_earnings set collected_on = '"
                                        .concat(`${today}`)
                                        .concat("' where _id = '")
                                        .concat(`${pid}`)
                                        .concat("'"),
                                        "null"
                                      );
                                      request(opt9, (error, response) => {
                                        if (error) throw new Error(error);
                                        else {
                                          let opt8 = updateFunction(
                                            "update account_info set main_balance = '"
                                                .concat(`${mb}`)
                                                .concat("', product_income = '")
                                                .concat(`${pi}`)
                                                .concat("', total_income = '")
                                                .concat(`${tti}`)
                                                .concat("', today_income = '")
                                                .concat(`${ti}`)
                                                .concat("', income_date = '")
                                                .concat(`${today}`)
                                                .concat("' where email = '")
                                                .concat(`${email}`)
                                                .concat("'"),
                                            "select * from account_info where email = '"
                                                .concat(`${email}`)
                                                .concat("'")
                                          );

                                          request(opt8, (error, response) => {
                                            if (error) throw new Error(error);
                                            else {
                                              let m2 = JSON.parse(response.body);
                                              // console.log(m2);
                                            }
                                          });
                                        }
                                      });
                                    }
                                else if (kExpired <= kToday) {
                                  let pid2 = k1[i]._id;
                                  let opt10 = updateFunction(
                                    "update product_earnings set status = 'expired' where _id = '"
                                      .concat(`${pid2}`)
                                      .concat("'"),
                                    "select * from product_earnings where email = '"
                                      .concat(`${email}`)
                                      .concat("'")
                                  );
                                  request(opt10, (error, response) => {
                                    if (error) throw new Error(error);
                                    else {
                                      let lol = JSON.parse(response.body);
                                      // console.log(lol);
                                    }
                                  });
                                }
                              }           
                            }
                          });     
                        }
                      });
                    }
                  });

                  let opt11 = selectFunction(
                    "select date from machine_profit where email = '"
                      .concat(`${email}`)
                      .concat("'")
                  )

                  request(opt11, (error, response) => {
                    if (error)throw new Error(error);
                    else {
                      let k3 = JSON.parse(response.body);
                      // let kSplit3 = k3['1'].date.split('/');
                      // let kDate3 = `'${kSplit3[2]}-${kSplit3[1]}-${kSplit3[0]}'`;
                      // let kAvailable = new Date(kDate3).getTime();
                      // let kToday2 = new Date().getTime();

                      // console.log(k3['1'].date !== today);
                      // console.log(k3, k3['1'].date, today);
                      if(k3['1'].date !== today) {
                          let opt12 = updateFunction(
                            "update machine_profit set status = 'available' where email = '"
                              .concat(`${email}`)
                              .concat("'"),
                            "null"
                          );
                          request(opt12, (error, response) => {
                            // console.log('bye from home');
                            if (error)throw new Error(error);
                            else {
                              // console.log("available");
                              let opt13 = selectFunction("select * from settings");
                              request(opt13, (error, response) => {
                                if (error)throw new Error(error);
                                else {
                                  let k4 = JSON.parse(response.body);
                                  // console.log(k4);
                                  return res.render("home", {
                                    docTitle: "Home",
                                    data: z["1"],
                                    st: st,
                                    cl: cl,
                                    data2: x["1"],
                                    freeVip: y["1"],
                                    Vip1: y["2"],
                                    Vip2: y["3"],
                                    Vip3: y["4"],
                                    Vip4: y["5"],
                                    Vip5: y["6"],
                                    Vip6: y["7"],
                                    today: today,
                                    date: co,
                                    kty: k4['1']
                                  });
                                }
                              })
                            }
                          });
                      }
                      else {
                        // console.log('hii from home...');
                        let opt14 = selectFunction("select * from settings");
                        request(opt14, (error, response) => {
                          if (error)throw new Error(error);
                          else {
                            let k5 = JSON.parse(response.body);
                            // console.log(k5);
                            return res.render("home", {
                              docTitle: "Home",
                              data: z["1"],
                              st: st,
                              cl: cl,
                              data2: x["1"],
                              freeVip: y["1"],
                              Vip1: y["2"],
                              Vip2: y["3"],
                              Vip3: y["4"],
                              Vip4: y["5"],
                              Vip5: y["6"],
                              Vip6: y["7"],
                              today: today,
                              date: co,
                              kty: k5['1']
                            });
                          }
                        })
                      }
                    }
                  });
                }
                catch(error) {
                  console.log("home", error);
                }
              }
            });
          });
        }
      });
  })
);

router.get("/user/collectReward", catchAsync(async (req, res, next) => {
  const email = req.session.name;

  let options = selectFunction(
    "select * from account_info where email = '".concat(`${email}`).concat("'")
  );

  request(options, (error, response) => {
    if (error) throw new Error(error);
    else {
      let x = JSON.parse(response.body);
      // console.log(x);
      // console.log("------------------------");
      let mb = parseFloat(x["1"].main_balance);
      let total_income = parseFloat(x["1"].total_income);
      let today_income = parseFloat(x["1"].today_income);
      let income_date = x["1"].income_date;

      let today = new Date();
      let dt = String(today.getDate()).padStart(2, "0");
      let mt = String(today.getMonth() + 1).padStart(2, "0");
      let yt = today.getFullYear();

      today = dt + "/" + mt + "/" + yt;

      let ttt = new Date();
      let hh = ttt.getHours();
      let mm = ttt.getMinutes();
      let ss = ttt.getSeconds();

      let getTime = hh + ":" + mm + ":" + ss;

      let opt1 = selectFunction(
        "select * from machine_profit where email = '"
          .concat(`${email}`)
          .concat("'")
      );

      request(opt1, function (error, response) {
        if (error) throw new Error(error);
        else {
          let y = JSON.parse(response.body);
          // console.log(y);
          // console.log("------------------------");
          let machine_profit = parseFloat(y["1"].machine_profit);
          mb += machine_profit;
          total_income += machine_profit;
        //   Changed now
          if (income_date == today) {
            today_income += machine_profit;
          }
          else {
            today_income += machine_profit;
          }

          // console.log(mb, machine_profit, total_income, today_income);

          let te = parseFloat(y["1"].total_earnings);
          let crr_level = x["1"].current_level;

          let opt2 = updateFunction(
            "update account_info set main_balance = '"
              .concat(`${mb}`)
              .concat("', total_income = '")
              .concat(`${total_income}`)
              .concat("', today_income = '")
              .concat(`${today_income}`)
              .concat("', income_date = '")
              .concat(`${today}`)
              .concat("' where email = '")
              .concat(`${email}`)
              .concat("'"),
            "select * from account_info where email = '"
              .concat(`${email}`)
              .concat("'")
          );

          request(opt2, (error, response) => {
            if (error) throw new Error(error);
            else {
              let z = JSON.parse(response.body);
              // console.log(z);
              // console.log("------------------------");
              let opt3 = selectFunction(
                "select level_income from levels where level_name = '"
                  .concat(`${crr_level}`)
                  .concat("'")
              );
              request(opt3, (error, response) => {
                if (error) throw new Error(error);
                else {
                  let k = JSON.parse(response.body);
                  let level_income = parseFloat(k["1"].level_income);
                  te += level_income;
                  let opt4 = updateFunction(
                    "update machine_profit set date = '"
                      .concat(`${today}`)
                      .concat("', time = '")
                      .concat(`${getTime}`)
                      .concat("', total_earnings = '")
                      .concat(`${te}`)
                      .concat("', status = 'collected' where email = '")
                      .concat(`${email}`)
                      .concat("'"),
                    "select * from machine_profit where email = '"
                        .concat(`${email}`)
                        .concat("'")
                  );

                  request(opt4, (error, response) => {
                    if (error) throw new Error(error);
                    else {
                      let k1 = JSON.parse(response.body);
                      // console.log(k1);
                      return res.redirect("/user/home");
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
  })
);

router.get("/user/finance", catchAsync(async (req, res, next) => {
  let options = {
    method: "POST",
    url: "https://cash4.fun/connection/secure/api/cash4app/select.php",
    headers: {},
    formData: {
      select_query: "select * from products",
    },
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    let x = JSON.parse(response.body);
    // console.log(x);
    let email = req.session.name;
    // console.log(email);
    let opt = selectFunction(
      "select * from account_info where email = '"
        .concat(`${email}`)
        .concat("'")
    );
    request(opt, function (error, response) {
      if (error) throw new Error(error);
      let y = JSON.parse(response.body);
      // console.log(y);

      let opt2 = selectFunction(
        "select * from product_earnings where email = '"
          .concat(`${email}`)
          .concat("'")
      );

      try {
        request(opt2, (error, response) => {
          if (error) throw new Error(error);
          else {
            let z = JSON.parse(response.body);
            // console.log(z, z == null);

            for (let i = 0; i < z.length; i++) {
              if (z[i] == null) continue;
              else if (z[i].status == 'active') {
                return res.render("finance", {
                  docTitle: "Finance",
                  x1: x["1"],
                  x2: x["2"],
                  x3: x["3"],
                  x4: x["4"],
                  x5: x["5"],
                  x6: x["6"],
                  y1: y["1"],
                  z1: z
                });
              }
            }

            return res.render("finance", {
              docTitle: "Finance",
              x1: x["1"],
              x2: x["2"],
              x3: x["3"],
              x4: x["4"],
              x5: x["5"],
              x6: x["6"],
              y1: y["1"],
              z1: []
            });
          }
        });
      }
      catch(error) {
        console.log("finance", error);
      }      
    });
  });
  })
);

router.get("/user/financial/:id", catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const email = req.session.name;

  let options = selectFunction(
    "select * from products where p_id = '".concat(`${id}`).concat("'")
  );

  try {
    request(options, function (error, response) {
      if (error) throw new Error(error);
      else {
        let x = JSON.parse(response.body);
        let duration = parseFloat(x["1"].duration);
        let date = new Date();
        Date.prototype.addDays = function (days) {
          date = new Date(this.valueOf());
          date.setDate(date.getDate() + days);
          return date;
        };

        const newDate = date.addDays(duration);

        const yyyy = newDate.getFullYear();
        let mm = newDate.getMonth() + 1; // Months start at 0!
        let dd = newDate.getDate();

        let newDate2 = `${dd}/${mm}/${yyyy}`;
        // let newDate3 = `${d}/${m}/${y}`;

        var today = new Date();
        var d = String(today.getDate()).padStart(2, "0");
        var m = String(today.getMonth() + 1).padStart(2, "0");
        var y = today.getFullYear();

        today = d + "/" + m + "/" + y;

        let f = parseFloat(x["1"].daily_rate) * parseFloat(x["1"].duration);
        let opt1 = selectFunction(
          "select * from product_earnings where email = '"
            .concat(`${email}`)
            .concat("'")
        );

        request(opt1, function (error, response) {
          if (error) throw new Error(error);
          else {
            let k = JSON.parse(response.body);
            let active = 0;
            let set = false;

            for (let i = 1; i < k.length; i++) {
              if (k[i].product_id == id && k[i].status == "active") {
                set = true;
                active++;
                break;
              }
            }
            let opt2 = selectFunction(
              "select * from account_info where email = '"
                .concat(`${email}`)
                .concat("'")
            );
            request(opt2, (error, response) => {
              if (error) throw new Error(error);
              else {
                let l = JSON.parse(response.body);
                return res.render("financial", {
                  docTitle: "Financial",
                  x: x["1"],
                  newDate2: newDate2,
                  newDate3: today,
                  f,
                  set,
                  active,
                  l: l["1"],
                });
              }
            });
          }
        });
      }
    });
  }
  catch(error) {
    console.log("financial", error);
  }
  })
);

router.get("/user/confirm/:id", catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const email = req.session.name;

  let options = selectFunction(
    "select * from products where p_id = '".concat(`${id}`).concat("'")
  );

  try {
    request(options, (error, response) => {
      if (error) throw new Error(error);
      else {
        let x = JSON.parse(response.body);
        let opt1 = selectFunction(
          "select * from account_info where email = '"
            .concat(`${email}`)
            .concat("'")
        );
        request(opt1, (error, response) => {
          if (error) throw new Error(error);
          else {
            let k = JSON.parse(response.body);
            let duration = parseFloat(x["1"].duration);
            let code = Math.floor(Math.random() * (200000 - 100000) + 100000);
            let date = new Date();
            Date.prototype.addDays = function (days) {
              date = new Date(this.valueOf());
              date.setDate(date.getDate() + days);
              return date;
            };

            const newDate = date.addDays(duration);

            const yyyy = newDate.getFullYear();
            let mm = newDate.getMonth() + 1; // Months start at 0!
            let dd = newDate.getDate();

            let newDate2 = `${dd}/${mm}/${yyyy}`;

            var today = new Date();
            var d = String(today.getDate()).padStart(2, "0");
            var m = String(today.getMonth() + 1).padStart(2, "0");
            var y = today.getFullYear();

            today = d + "/" + m + "/" + y;

            let opt2 = selectFunction(
              "select * from products where p_id = '".concat(`${id}`).concat("'")
            );

            request(opt2, (error, response) => {
              if (error) throw new Error(error);
              else {
                let l1 = JSON.parse(response.body);
                let pid = l1["1"].p_id;
                let title = l1["1"].title;
                let dr = l1["1"].daily_rate;
                let mi = l1["1"].min_invest;
                let dur = l1["1"].duration;
                let cl = k["1"]["current_level"];
                // console.log(l1, newDate2, today, duration);
                let values = `\'${code}\', '${email}\', '${cl}\', '${pid}\', '${title}\', '${dr}\', '${mi}\', '${dur}\', 'null\', '${today}\', '${newDate2}\', 'active\'`;

                let opt3 = insertFunction(
                  "insert into product_earnings (_id, email, current_level, product_id, product_name, daily_rate, min_invest, duration, collected_on, bought_on, expire_date, status) values("
                    .concat(`${values}`)
                    .concat(")"),
                  "select * from product_earnings where email = '"
                    .concat(`${email}`)
                    .concat("'")
                );

                request(opt3, (error, response) => {
                  if (error) throw new Error(error);
                  else {
                    let o = JSON.parse(response.body);
                    let accBal = parseFloat(k["1"]["main_balance"]);
                    let myInv = parseFloat(k["1"]["my_investment"]);
                    mi = parseFloat(mi);

                    let remBal = parseFloat(accBal - mi);
                    // let interest = parseFloat((mi / 100)) * parseFloat(dr);
                    // remBal = parseFloat(remBal + interest);
                    myInv += mi;
                    // console.log(interest);

                    let opt4 = updateFunction(
                      "update account_info set main_balance = '"
                        .concat(`${remBal}`)
                        .concat("', my_investment = '")
                        .concat(`${myInv}`)
                        .concat("', income_date = '")
                        .concat(`${today}`)
                        .concat("' where email = '")
                        .concat(`${email}`)
                        .concat("'"),
                      "select * from account_info where email = '"
                        .concat(`${email}`)
                        .concat("'")
                    );

                    request(opt4, (error, response) => {
                      if (error) throw new Error(error);
                      else {
                        let p = JSON.parse(response.body);
                        // console.log(p);
                      }
                    });
                  }
                });
              }
            });

            return res.redirect("/user/finance");
          }
        });
      }
    });
  }
  catch(error) {
    console.log("confirm", error);
  }
  })
);

router.get("/user/vip", catchAsync(async (req, res, next) => {
  let options = {
    method: "POST",
    url: "https://cash4.fun/connection/secure/api/cash4app/select.php",
    headers: {},
    formData: {
      select_query: "select * from levels where level_status = 'active'",
    },
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    let x = JSON.parse(response.body);
    let email = req.session.name;
    let opt = selectFunction(
      "select current_level from account_info where email = '"
        .concat(`${email}`)
        .concat("'")
    );

    request(opt, function (error, response) {
      if (error) throw new Error(error);
      else {
        let y = JSON.parse(response.body);
        const crr_level = y["1"].current_level;
        // console.log(crr_level);
        let opt1 = selectFunction(
          "select * from levels where level_name = '"
            .concat(`${crr_level}`)
            .concat("'")
        );
        request(opt1, function (error, response) {
          if (error) throw new Error(error);
          else {
            let z = JSON.parse(response.body);
            // console.log(z['1']);
            // console.log(x);
            return res.render("vip", {
              docTitle: "VIP",
              x1: x["1"],
              x2: x["2"],
              x3: x["3"],
              x4: x["4"],
              x5: x["5"],
              x6: x["6"],
              x7: x["7"],
              z1: z["1"],
            });
          }
        });
      }
    });
  });
  })
);

router.get("/user/buyVip/:n", catchAsync(async (req, res, next) => {
  const { n } = req.params;
  const email = req.session.name;

  let opt1 = selectFunction(
    "select * from levels where level_name = '".concat(`${n}`).concat("'")
  );
  request(opt1, (error, response) => {
    if (error) throw new Error(error);
    else {
      let x = JSON.parse(response.body);
      let opt2 = selectFunction(
        "select * from account_info where email = '"
          .concat(`${email}`)
          .concat("'")
      );

      request(opt2, (error, response) => {
        if (error) throw new Error(error);
        else {
          let y = JSON.parse(response.body);
          return res.render("buyVip", {
            docTitle: "BuyVip",
            x: x["1"],
            accBal: parseInt(y["1"].main_balance),
            price: parseInt(x[1].level_price),
          });
        }
      });
    }
  });
  })
);

router.get("/user/yesConfirm/:n", catchAsync(async (req, res, next) => {
  const { n } = req.params;
  const email = req.session.name;

  let options = selectFunction(
    "select * from levels where level_name = '".concat(`${n}`).concat("'")
  );

  request(options, (error, response) => {
    if (error) throw new Error(error);
    else {
      let x = JSON.parse(response.body);
      let level_price = parseFloat(x["1"].level_price);
      let lname = x["1"].level_name;
      let profit =  parseFloat(x["1"].machine_profit);

      let opt = selectFunction(
        "select * from account_info where email = '"
          .concat(`${email}`)
          .concat("'")
      );

      request(opt, (error, response) => {
        if (error) throw new Error(error);
        else {
          let y = JSON.parse(response.body);
          let accBal = parseFloat(y["1"].main_balance);
          let tti = parseFloat(y['1'].total_income);
          let tt = parseFloat(y['1'].today_income);

          if (accBal >= level_price) {
            accBal -= level_price;
          }

          accBal += profit;
          tti += profit;
          tt += profit;

          // console.log(accBal, profit, tt, tti);

          let opt2 = updateFunction(
            "update account_info set main_balance = '"
              .concat(`${accBal}`)
              .concat("', total_income = '")
              .concat(`${tti}`)
              .concat("', today_income = '")
              .concat(`${tt}`)
              .concat("', current_level = '")
              .concat(`${lname}`)
              .concat("' where email = '")
              .concat(`${email}`)
              .concat("'"),
            "select * from account_info where email = '"
              .concat(`${email}`)
              .concat("'")
          );

          request(opt2, (error, response) => {
            if (error) throw new Error(error);
            else {
              let z = JSON.parse(response.body);
              // console.log(z);
              let opt3 = updateFunction(
                "update machine_profit set current_level = '"
                  .concat(`${lname}`)
                  .concat("', machine_profit = '")
                  .concat(`${profit}`)
                  .concat("' where email = '")
                  .concat(`${email}`)
                  .concat("'"),
                "null"
              );

              request(opt3, (error, response) => {
                if (error) throw new Error(error);
                else {
                  let opt4 = updateFunction(
                    "update product_earnings set current_level = '"
                      .concat(`${lname}`)
                      .concat("' where email = '")
                      .concat(`${email}`)
                      .concat("'"),
                    "null"
                  );

                  request(opt4, (error, response) => {
                    if (error) throw new Error(error);
                    return res.redirect("/user/vip");
                  });
                }
              });
            }
          });
        }
      });
    }
  });
  })
);

router.get("/user/team", catchAsync(async (req, res, next) => {
  let email = req.session.name;
  let options = selectFunction(
    "select invitation_code from account_info where email = '"
      .concat(`${email}`)
      .concat("'")
  );

  request(options, (error, response) => {
    if (error) throw new Error(error);
    else {
      let x = JSON.parse(response.body);
      let opt1 = selectFunction("select * from settings");
      request(opt1, (error, response) => {
        if (error) throw new Error(error);
        else {
          let k4 = JSON.parse(response.body);
          // console.log(k4['1']);
          return res.render("team", { docTitle: "Team", x: x["1"], k4: k4['1'] });
        }
      })
    }
  });
  })
);

router.get("/user/withdrawal", catchAsync(async (req, res, next) => {
    let email = req.session.name;

    let options = selectFunction(
      "select * from account_info where email = '".concat(`${email}`).concat("'")
    );

    request(options, function (error, response) {
      if (error) throw new Error(error);
      else {
        let x = JSON.parse(response.body);
        let current_level = x["1"]["current_level"];
        let opt1 = selectFunction(
          "select withdrawal_amount from levels where level_name = '"
            .concat(current_level)
            .concat("'")
        );
        try {
          request(opt1, function (error, response) {
            if (error) throw new Error(error);
            else {
              let y = JSON.parse(response.body);
              let accBBB = x["1"]["main_balance"];
              let wAmt = y["1"]["withdrawal_amount"];
              let opt2 = selectFunction(
                "select * from withdrawals where email = '"
                  .concat(`${email}`)
                  .concat("'")
              );
              request(opt2, function (error, response) {
                if (error) throw new Error(error);
                else {
                  let z = JSON.parse(response.body);
                  // console.log(z, wAmt);
                  return res.render("withdraw", {
                    docTitle: "Withdraw",
                    accBBB,
                    wAmt,
                    z: z,
                  });
                }
              });
            }
          });
        }
        catch(error) {
          console.log("Withdraw", error);
        }
      }
    });
  })
);

router.get("/user/recharge", catchAsync(async (req, res, next) => {
  let email = req.session.name;
  let options = selectFunction(
    "select * from deposits where email = '".concat(`${email}`).concat("'")
  );

  request(options, function (error, response) {
    if (error) throw new Error(error);
    else {
      let x = JSON.parse(response.body);
      let opt1 = selectFunction("select * from settings");
      request(opt1, function (error, response) {
        if (error) throw new Error(error);
        let y = JSON.parse(response.body);
        // console.log(x,y, x.length <= 1, x.length);
        res.render("recharge", { docTitle: "Recharge", y: y["1"], x: x });
      });
    }
  });
  })
);

router.get("/user/account", catchAsync(async (req, res, next) => {
  // Query using account_info
  let email = req.session.name;
  let options = selectFunction(
    "select * from account_info where email = '".concat(`${email}`).concat("'")
  );
  var today = new Date();
  var d = String(today.getDate()).padStart(2, "0");
  var m = String(today.getMonth() + 1).padStart(2, "0");
  var y = today.getFullYear();

  today = d + "/" + m + "/" + y;

  request(options, function (error, response) {
    if (error) throw new Error(error);
    else {
      let x = JSON.parse(response.body);
      // console.log(x['1']);
      let income_date = x["1"].income_date;
      let opt1 = selectFunction("select * from settings");
      request(opt1, (error, response) => {
        if (error) throw new Error(error);
        else {
          let k4 = JSON.parse(response.body);
          res.render("account", {
            docTitle: "Account",
            x1: x["1"],
            today,
            income_date,
            k4: k4['1']
          });
        }
      })
    }
  });
  })
);

router.get("/settings", catchAsync(async (req, res, next) => {
    const email = req.session.name;

    let options = selectFunction(
      "select * from account_info where email = '"
        .concat(`${email}`)
        .concat("'")
    );

    try {
      request(options, (error, response) => {
        if (error) throw new Error(error);
        else {
          let x = JSON.parse(response.body);
          // console.log(x);
          return res.render('setting', { docTitle: 'Settings', x: x['1'] });
        }
      });
    }
    catch(error) {
      console.log(error);
    }
  })
);

router.get("/user/faq", catchAsync(async (req, res, next) => {
    let opt1 = selectFunction(
      "select * from faq"
    )

    request(opt1, (error, response) => {
      if (error) throw new Error(error);
      else {
        let z = JSON.parse(response.body);
        // console.log(z);
         return res.render('faq', { docTitle: 'FAQ', z: z['1']});
      }
    });
  })
);

router.get("/user/notice", catchAsync(async (req, res, next) => {
    let opt1 = selectFunction(
      "select * from notice where receiver = 'all'"
    )

    request(opt1, (error, response) => {
      if (error) throw new Error(error);
      else {
        let z = JSON.parse(response.body);
        // console.log(z);
        if (z.length == 1) return res.render('notice', { docTitle: 'Notice', z: z });
        else {
          return res.render('notice', { docTitle: 'Notice', z: z });
        }
      }
    });

  })
);

router.post("/user/login",
  catchAsync(async (req, res, next) => {
    const { email, psword } = req.body;

    let options = selectFunction(
      "select * from account_info where email = '"
        .concat(`${email}`)
        .concat("'")
    );

    try {
      request(options, function (error, response) {
        if (error) throw new Error(error);
        else {
          let x = JSON.parse(response.body);
          if (x["0"] == null && x["1"] == undefined){
            return res.redirect("/user/register");
          }
          else if (x["1"].password !== psword) {
            // req.flash('error', error.message);
            // console.log("Invalid Password");
            return res.redirect('/');
          } else {
            req.session.name = x["1"].email;
            req.session.save();
            let options = selectFunction(
              "select * from levels where level_status = 'active'"
            );
            request(options, function (error, response) {
              if (error) throw new Error(error);
              // else {
              //   let y = JSON.parse(response.body);
              //   // req.flash('server-success', 'User Successfully Registered...');
              //   // console.log(y["1"]);
              //   // return res.render("home", {
              //   //   docTitle: "Home",
              //   //   data: x["1"],
              //   //   freeVip: y["1"],
              //   // });
              //   return res.redirect("/user/home");
              // }
            });
          }
          return res.redirect('/user/home');
        }
      });
    }
    catch(error) {
      console.log('hii', error);
    }
  })
);

router.post("/user/register",
  catchAsync(async (req, res, next) => {
    let { country, email, phone, psword, cpsword, invCode } = req.body;

    if (cpsword !== psword) {
      return res.redirect("/user/register");
    } else {
      let arr = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];

      let code = Math.floor(Math.random() * (200000 - 100000) + 100000);
      let date = new Date();
      let x = date.getDate();
      let m = date.getMonth();
      let y = date.getFullYear();
      let n = date.toLocaleTimeString();
      let newDate = String(x)
        .concat("-", arr[date.getMonth()])
        .concat("-", String(y))
        .concat(" ", n);
      let newDate2 = String(x).concat("/", String(m)).concat("/", String(y));

      let opt1 = selectFunction(
        "select * from account_info where email = '"
          .concat(`${email}`)
          .concat("'")
      );

      request(opt1, (error, response) => {
        if (error) throw new Error(error);
        else {
          let z2 = JSON.parse(response.body);

          if (z2['1'] != undefined) return res.redirect('/');
          else {
            let opt2 = selectFunction(
              "select * from account_info where invitation_code = '"
                .concat(`${invCode}`)
                .concat("'")
            );
            
            try {
              request(opt2, (error, response) => {
                if (error) throw new Error(error);
                else {
                  let z = JSON.parse(response.body);
                  // console.log(z);

                  if (z['1'] !== undefined) {
                    for (let i = 0; i < z.length; i++) {
                      if (z[i] == null) continue;

                        let owner = z['1'].email;
                        let rDate = z['1'].income_date;
                      
                        let values3 = `\'${email}\', '${owner}\', '${invCode}\', '${rDate}\', '0\', 'unpaid\', '10\', 'true\'`;
                        
                        let opt3 = insertFunction(
                          "insert into referrals (referred_user, owner, invitation_code, date, earnings, status, percentage, isReferredUserValid) values("
                            .concat(`${values3}`)
                            .concat(")"),
                          "select * from referrals where referred_user = '"
                            .concat(`${email}`)
                            .concat("'")
                        )
            
                        request(opt3, (error, response) => {
                          if (error) throw new Error(error);
                          else {
                            let z1 = JSON.parse(response.body);
                            // console.log(z1);

                            let values = `\'${email}\','${psword}\', '${country}\', '${phone}\', '0\', '0\', '0\', '0\', 'null\', 'Free VIP\', '${code}\', '${invCode}\', '${newDate}\', '${psword}\', 'activated\', 'true\', '0\', '0\', '0\'`;
                            let values2 = `\'${email}\', 'Free VIP\', '0.5\', '0\', '${newDate2}\', '${n}\', 'waiting\'`;
                      
                            let options = {
                              method: "POST",
                              url: "https://cash4.fun/connection/secure/api/cash4app/insert.php",
                              formData: {
                                insert_query:
                                  "insert into account_info (email,password,country_code,phone,deposited_amount,main_balance,total_income,today_income,income_date,current_level,invitation_code,under_referral,account_created_on,withdrawal_password,account_status,withdrawal_on,total_withdrawals,my_investment,product_income) values("
                                    .concat(`${values}`)
                                    .concat(")"),
                                select_query: "select * from account_info where email = '"
                                  .concat(`${email}`)
                                  .concat("'"),
                              },
                            };
                      
                            request(options, function (error, response) {
                              if (error) throw new Error(error);
                              let x = JSON.parse(response.body);
                              // console.log(x);
                      
                              if (x["1"] !== null) {
                                req.session.name = x["1"].email;
                                req.session.save();

                                let opt = insertFunction(
                                  "insert into machine_profit (email, current_level, machine_profit, total_earnings, date, time, status) values("
                                    .concat(`${values2}`)
                                    .concat(")"),
                                  "select * from machine_profit where email = '"
                                    .concat(`${email}`)
                                    .concat("'")
                                );
                      
                                request(opt, function (error, response) {
                                  if (error) throw new Error(error);
                                  else {
                                    let opt4 = selectFunction(
                                      "select * from levels where level_status = 'active'"
                                    );
                                    request(opt4, function (error, response) {
                                      if (error) throw new Error(error);
                                      // else {
                                      //   let y = JSON.parse(response.body);
                                      //   // console.log(y);
                                      //   // return res.render("home", {
                                      //   //   docTitle: "Home",
                                      //   //   data: x["1"],
                                      //   //   freeVip: y["1"],
                                      //   // });
                                      //   return res.redirect("/user/home");
                                      // }
                                    });
                                    return res.redirect("/user/home");
                                  }
                                });
                              } 
                              else {
                                return res.redirect("/user/register");
                              }
                            });
                          }
                        })
                    }
                  }
                  else {
                    return res.redirect('/user/register');
                  }
                }
              });
            }
            catch(error) {
              console.log('register', error);
            }
          }
        }
      })
    }
  })
);

router.post("/user/forgetPsword",
  catchAsync(async (req, res, next) => {
    const { email, psword, cpsword } = req.body;

    let options = selectFunction(
      "select * from account_info where email = '"
        .concat(`${email}`)
        .concat("'")
    );
    request(options, (error, response) => {
      if (error) throw new Error(error);
      else {
        let x = JSON.parse(response.body);
        if (x['1'] == null) return res.redirect('/user/register');
        else {
          if(psword !== cpsword) return res.redirect('/user/forgetPsword');
          else {
            let opt1 = updateFunction(
              "update account_info set password = '"
                .concat(`${psword}`)
                .concat("' where email = '")
                .concat(`${email}`)
                .concat("'"),
              "select * from account_info where email = '"
                .concat(`${email}`)
                .concat("'")
            );

            request(opt1, (error, response) => {
              if (error) throw new Error(error);
              else {
                let y = JSON.parse(response.body);
                return res.redirect('/');
              }
            })
          }
        }
      }
    })
  })
);

router.post("/user/settings", catchAsync(async (req, res, next) => {
    const email = req.session.name;
    const { oldP, newP, confirmP } = req.body;

    let options = selectFunction(
      "select * from account_info where email = '"
        .concat(`${email}`)
        .concat("'")
    );
    request(options, (error, response) => {
      if (error) throw new Error(error);
      else {
        let x = JSON.parse(response.body);
        if (x[1].password !== oldP) return res.redirect('/settings');
        else {
          if (newP == confirmP) {
            let opt1 = updateFunction(
              "update account_info set password = '"
                .concat(`${newP}`)
                .concat("' where email = '")
                .concat(`${email}`)
                .concat("'"),
              "select * from account_info where email = '"
                .concat(`${email}`)
                .concat("'")
            );

            request(opt1, (error, response) => {
              if (error) throw new Error(error);
              else {
                let y = JSON.parse(response.body);
                // console.log(y);
                return res.redirect('/user/account');
              }
            })
          }
        }
      }
    })
  })
);

router.post("/user/withdrawal",
  catchAsync(async (req, res, next) => {
    const { amount, mode, address } = req.body;
    let email = req.session.name;

    let id = Math.floor(Math.random() * (200000 - 100000) + 100000);

    let arr = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];

    let date = new Date();
    let x = date.getDate();
    let y = date.getFullYear();
    let n = date.toLocaleTimeString();
    let newDate = String(x)
      .concat("-", arr[date.getMonth()])
      .concat("-", String(y))
      .concat(" ", n);

    let Amount = parseFloat(amount);

    let wFee = Amount * 0.03;

    let amt = Amount - wFee;

    let options = selectFunction(
      "select * from account_info where email = '".concat(email).concat("'")
    );

    request(options, function (error, response) {
      if (error) throw new Error(error);
      else {
        let x = JSON.parse(response.body);
        let current_level = x["1"]["current_level"];
        let opt1 = selectFunction(
          "select withdrawal_amount from levels where level_name = '"
            .concat(current_level)
            .concat("'")
        );

        try {
          request(opt1, function (error, response) {
            if (error) throw new Error(error);
            else {
              let y = JSON.parse(response.body);
              let wAmt = parseFloat(y["1"]["withdrawal_amount"]);
              let accBal = parseFloat(x["1"]["main_balance"]);
              let phone = x["1"]["phone"];

              let values = `\'${id}\', '${email}\', '${phone}\', '${amt}\', 'USD\', '${mode}\', '${address}\', '${newDate}\', '${wFee}\', 'pending\', 'change this (date) when you change the payment status\'`;

              // console.log(wAmt, accBal, Amount);
              if (wAmt > Amount) {
                console.log("Invalid Amount");
              } else if (accBal < Amount) {
                console.log("Insufficient Balance");
              }
              else {
                let opt2 = insertFunction(
                  "insert into withdrawals(id,email,phone,amount,currency,payment_method,wallet_address,date,withdrawal_fee,status,status_changed_on) values ("
                    .concat(`${values}`)
                    .concat(")"),
                  "select * from withdrawals where email = '"
                    .concat(`${email}`)
                    .concat("'")
                );

                let accBBB = parseFloat(accBal - Amount);
                let gtw = parseInt(x["1"]["total_withdrawals"]);

                request(opt2, function (error, response) {
                  if (error) throw new Error(error);
                  else {
                    let z = JSON.parse(response.body);
                    gtw += 1;
                    let opt3 = updateFunction(
                      "update account_info set main_balance = '"
                        .concat(`${accBBB}`)
                        .concat("',total_withdrawals='")
                        .concat(`${gtw}`)
                        .concat("' where email = '")
                        .concat(`${email}`)
                        .concat("'"),
                      "select * from account_info where email = '"
                        .concat(`${email}`)
                        .concat("'")
                    );
                    request(opt3, function (error, response) {
                      if (error) throw new Error(error);
                      else {
                        let a = JSON.parse(response.body);
                        // console.log(a);
                        // console.log(z, a, accBBB, accBal, Amount);
                        // return res.render("withdraw", {
                        //   docTitle: "Withdraw",
                        //   wAmt,
                        //   accBBB,
                        // });
                      }
                    });
                  }
                });
              }
              return res.redirect("/user/withdrawal");
            }
          });
        }
        catch(error) {
          console.log(error);
        }
      }
    });
  })
);

router.post("/user/recharge",
  catchAsync(async (req, res, next) => {
    const { address, price, mode } = req.body;
    const email = req.session.name;

    let id = Math.floor(Math.random() * (200000 - 100000) + 100000);

    let arr = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];

    let date = new Date();
    let x = date.getDate();
    let y = date.getFullYear();
    let n = date.toLocaleTimeString();
    let newDate = String(x)
      .concat("-", arr[date.getMonth()])
      .concat("-", String(y))
      .concat(" ", n);

    let amount = 0;
    let values = "";

    if(parseInt(price[0]) < 20) {
      console.log('p0 < 20');
      return res.redirect('/user/recharge');
    }
    else if (parseInt(price[1]) < 20) {
      console.log('p1 < 20');
      return res.redirect('/user/recharge');
    }
    else {
      if (price[1]) {
        amount = `$${price[1]}`;
        values = `\'${id}\', '${email}\', '${amount}\', '${mode}\', '${address}\', '${newDate}\', 'nothing', 'waiting for payment'`;
      } else {
        let p = price[0];
        values = `\'${id}\', '${email}\', '${p}\', '${mode}\', '${address}\', '${newDate}\', 'nothing', 'waiting for payment'`;
      }

      let options = insertFunction(
        "insert into deposits(id, email, amount, deposit_method, wallet_address, date, note, status) values ("
          .concat(`${values}`)
          .concat(")"),
        "select * from deposits where id = '".concat(`${id}`).concat("'")
      );

      request(options, function (error, response) {
        if (error) throw new Error(error);
        // else {
        //   let x = JSON.parse(response.body);
        // }
      });

      return res.redirect("/user/recharge");
    }
  })
);

router.post("/user/logout",
  catchAsync(async (req, res, next) => {
    req.session.destroy();
    res.redirect("/");
  })
);

module.exports = router;
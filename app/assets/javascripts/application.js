// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require rails-ujs
//= require turbolinks
//= require jquery
//= require jcanvas
//= require_tree .

    /*var areas = [
                    {code : 1, name: "北海道", color:
                    <% if current_user.user_ken.find_by(ken_id:1) %>
                            "red", 
                    <% else %>
                            "white",
                    <% end %>
                    hoverColor: "#b3b2ee", prefectures: [1]},
                    
                    {code : 2, name: "青森",
                    color: 
                    <% if current_user.user_ken.find_by(ken_id:2) %>
                            "red", 
                    <% else %>
                            "white",
                    <% end %>
                    hoverColor: "#98b9ff", prefectures: [2]},
                    {code : 3, name: "岩手", color: "white", hoverColor: "#98b9ff", prefectures: [3]},
                    {code : 4, name: "宮城", color: "white", hoverColor: "#98b9ff", prefectures: [4]},
                    {code : 5, name: "秋田", color: "white", hoverColor: "#98b9ff", prefectures: [5]},
                    {code : 6, name: "山形", color: "white", hoverColor: "#98b9ff", prefectures: [6]},
                    {code : 7, name: "福島", color: "white", hoverColor: "#98b9ff", prefectures: [7]},
                    {code : 8, name: "茨城", color: "white", hoverColor: "#b7e5f4", prefectures: [8]},
                    {code : 9, name: "栃木", color: "white", hoverColor: "#b7e5f4", prefectures: [9]},
                    {code : 10, name: "群馬", color: "white", hoverColor: "#b7e5f4", prefectures: [10]},
                    {code : 11, name: "埼玉", color: "white", hoverColor: "#b7e5f4", prefectures: [11]},
                    {code : 12, name: "千葉", color: "white", hoverColor: "#b7e5f4", prefectures: [12]},
                    {code : 13, name: "東京", color: "white", hoverColor: "#b7e5f4", prefectures: [13]},
                    {code : 14, name: "神奈川", color: "white", hoverColor: "#b7e5f4", prefectures: [14]},
                    {code : 15, name: "新潟", color: "white", hoverColor: "#aceebb", prefectures: [15]},
                    {code : 16, name: "富山", color: "white", hoverColor: "#aceebb", prefectures: [16]},
                    {code : 17, name: "石川", color: "white", hoverColor: "#aceebb", prefectures: [17]},
                    {code : 18, name: "福井", color: "white", hoverColor: "#aceebb", prefectures: [18]},
                    {code : 19, name: "山梨", color: "white", hoverColor: "#aceebb", prefectures: [19]},
                    {code : 20, name: "長野", color: "white", hoverColor: "#aceebb", prefectures: [20]},
                    {code : 21, name: "岐阜", color: "white", hoverColor: "#aceebb", prefectures: [21]},
                    {code : 22, name: "静岡", color: "white", hoverColor: "#aceebb", prefectures: [22]},
                    {code : 23, name: "愛知", color: "white", hoverColor: "#aceebb", prefectures: [23]},
                    {code : 24, name: "三重", color: "white", hoverColor: "#fff19c", prefectures: [24]},
                    {code : 25, name: "滋賀", color: "white", hoverColor: "#fff19c", prefectures: [25]},
                    {code : 26, name: "京都", color: "white", hoverColor: "#fff19c", prefectures: [26]},
                    {code : 27, name: "大阪", color: "white", hoverColor: "#fff19c", prefectures: [27]},
                    {code : 28, name: "兵庫", color: "white", hoverColor: "#fff19c", prefectures: [28]},
                    {code : 29, name: "奈良", color: "white", hoverColor: "#fff19c", prefectures: [29]},
                    {code : 30, name: "和歌山", color: "white", hoverColor: "#fff19c", prefectures: [30]},
                    {code : 31, name: "鳥取", color: "white", hoverColor: "#ffe0a3", prefectures: [31]},
                    {code : 32, name: "島根", color: "white", hoverColor: "#ffe0a3", prefectures: [32]},
                    {code : 33, name: "岡山", color: "white", hoverColor: "#ffe0a3", prefectures: [33]},
                    {code : 34, name: "広島", color: "white", hoverColor: "#ffe0a3", prefectures: [34]},
                    {code : 35, name: "山口", color: "white", hoverColor: "#ffe0a3", prefectures: [35]},
                    {code : 36, name: "徳島", color: "white", hoverColor: "#ffbb9c", prefectures: [36]},
                    {code : 37, name: "香川", color: "white", hoverColor: "#ffbb9c", prefectures: [37]},
                    {code : 38, name: "愛媛", color: "white", hoverColor: "#ffbb9c", prefectures: [38]},
                    {code : 39, name: "高知", color: "white", hoverColor: "#ffbb9c", prefectures: [39]},
                    {code : 40, name: "福岡", color: "white", hoverColor: "#ffbdbd", prefectures: [40]},
                    {code : 41, name: "佐賀", color: "white", hoverColor: "#ffbdbd", prefectures: [41]},
                    {code : 42, name: "長崎", color: "white", hoverColor: "#ffbdbd", prefectures: [42]},
                    {code : 43, name: "熊本", color: "white", hoverColor: "#ffbdbd", prefectures: [43]},
                    {code : 44, name: "大分", color: "white", hoverColor: "#ffbdbd", prefectures: [44]},
                    {code : 45, name: "宮崎", color: "white", hoverColor: "#ffbdbd", prefectures: [45]},
                    {code : 46, name: "鹿児島", color: "white", hoverColor: "#ffbdbd", prefectures: [46]},
                    {code : 47, name: "沖縄", color:
                    <% if current_user.user_ken.find_by(ken_id:1) %>
                            "red", 
                    <% else %>
                            "white",
                    <% end %>
                     hoverColor: "#f5c9ff", prefectures: [47]},
                ];
    
    var kens = [ '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '山梨県', '長野県', '富山県', '石川県', '福井県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県' ]; 
    var kencode = 1;
    var areas =[];
    
    kens.forEach(function( value ) 
    {
         areas.push( {code : kencode,
                      name: value, 
                      color:"red",
                      hoverColor: "#b3b2ee", 
                      prefectures: [kencode]});
         kencode++;
    });  
                
   $("#map-container").japanMap({
        width: 730,
        selection: "area",
        areas: areas,
        backgroundColor : "#dcdcdc",
        borderLineColor: "#f2fcff",
        borderLineWidth : 0.25,
        lineColor : "#a0a0a0",
        lineWidth: 1,
        drawsBoxLine: true,
        showsPrefectureName: false,
        prefectureNameType: "short",
        movesIslands : true,
        fontSize : 11,
        fontShadowColor : "#fff",
        onSelect : function(data){
            alert(data.name);
        }
    });
*/

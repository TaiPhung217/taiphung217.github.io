---
title: "Codeql - basic to advanced"
excerpt: "CodeQL là một công cụ phân tích mã nguồn được phát triển bởi GitHub, cho phép bạn tìm và sửa các lỗ hổng bảo mật cũng như các lỗi trong mã nguồn. Nó sử dụng một ngôn ngữ truy vấn dựa trên SQL để truy vấn mã nguồn như một cơ sở dữ liệu."
header:
show_date: true
header:
  teaser: /assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/teaser.png
  teaser_home_page: true
  icon: 
  overlay_image: /assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/background.jpeg
categories:
  - Learn
tags:
  - Learn
  - Vietnamese
  - Codeql
---

Trong thế giới phát triển phần mềm, việc bảo mật mã nguồn và phát hiện lỗ hổng ngày càng trở nên quan trọng hơn bao giờ hết. CodeQL, một ngôn ngữ truy vấn mã nguồn mạnh mẽ do GitHub phát triển, đã nổi lên như một công cụ cho các nhà phát triển và chuyên gia bảo mật. Với khả năng truy vấn mã nguồn như một cơ sở dữ liệu, CodeQL giúp chúng ta phát hiện những lỗ hổng tiềm ẩn và các vấn đề bảo mật một cách hiệu quả.

Trong blog này, mình muốn lưu lại những kiến thức và kinh nghiệm mà tôi đã tích lũy được từ quá trình học và áp dụng CodeQL. Từ những khái niệm cơ bản đến các kỹ thuật nâng cao, bài viết được tham khảo từ nhiều nguồn.

# CodeQL là gì ?
Trước đây, pentester sẽ kiểm tra mã dự án thông qua kiểm tra dựa trên kinh nghiệm, tìm kiếm các funtion nguy hiểm và theo dõi xem liệu các tham số của function đó có thể kiểm soát được không. 
Tuy nhiên khi số lượng mã nguồn lớn, dự án ngày càng phức tạp, rất khó để bao phủ toàn bộ lỗ hổng của dự án bằng phương pháp này. Do đó, một số công cụ scan đã xuất hiện để hỗ trợ như RIPS, Cobra, Sonarqube, ...

Một vài công cụ mới nổi gần đây như CheckMarx, Fortify SCA cũng tốt nhưng hơi đắt. 

Lúc đó, Github đã mua lại một công ty khởi nghiệp CodeQL và chuyển toàn bộ rule scan của CodeQL thành opensource, để các kỹ sư bảo mật trên toàn thế giới có thể đóng góp vào bộ rule hiệu quả hơn , giúp Github giải quyết các vấn đề bảo mật. 

CodeQL hỗ trợ rất nhiều ngôn ngữ

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/1.png)

Chú ý: Người ta bảo rằng CodeQL không phù hợp cho các quy trình CI/CD nội bộ trong doanh nghiệp, nhưng chúng ta có thể sử dụng nó để nghiên cứu bảo mật, cá nhân mình nghĩ do một số vấn đề sau:

- Thời gian chạy lâu:
Codeql có thể mất khá nhiều thời gian để phân tích một lượng lớn mã nguồn, đặc biệt là đối với các dự án lớn hoặc phức tạp. Điều này có thể làm chậm quá trình CI/CD, gây ra sự chậm trễ không mong muốn trong việc tích hợp và triển khai các thay đổi mã nguồn.
- Tài nguyên hệ thống:
Chạy CodeQL yêu cầu một lượng tài nguyên hệ thống đáng kể, bao gồm CPU và RAM. Gây giảm hiệu suất
- Phức tạp trong cấu hình:
Cấu hình và duy trì CodeQL trong môi trường CI/CD có thể phức tạp và yêu cầu kiến thức chuyên môn về cả công cụ và dự án để build => tăng khối lượng công việc cho đội DevOps => Phức tạp quy trình CI/CD
- Kết quả sai lệch:
Tất nhiên rồi, các công cụ phân tích tĩnh như CodeQL có thể tạo ra các false positives hoặc false nagatives.
- Không phù hợp cho các thay đổi nhỏ:
Trong quy trình CI/CD, các thay đổi mã thường nhỏ và tần suất cao. CodeQL thường phù hợp hơn cho các phân tích bảo mật tổng thể và định kỳ, thay vì phân tích từng thay đổi nhỏ lẻ trong mã nguồn.

Thay vào đó chúng ta có thể: 

- Chạy CodeQL định kỳ: Thực hiện phân tích CodeQL định kỳ (ví dụ: hàng tuần hoặc hàng tháng) để giảm tải cho quy trình CI/CD.
- Chạy CodeQL trên các nhánh phát triển chính: Thay vì chạy trên mỗi commit, chỉ chạy CodeQL trên các nhánh chính như `main` hoặc `develop`.
- Sử dụng các công cụ CI/CD nhẹ hơn: Sử dụng các công cụ CI/CD có thời gian chạy ngắn hơn và tài nguyên yêu cầu ít hơn cho các phân tích bảo mật cơ bản, sau đó sử dụng CodeQL cho các phân tích chi tiết hơn.

# Demo lab
Triển khai một ví dụ về Java SpringBoot có chứa lỗ hổng injection đơn giản. Mục đích là sử dụng CodeQL để tự động truy xuất các lỗ hổng injection này, loại bỏ các kết quả dương tính giả, giải quyết các kết quả âm tính giả và một số vấn đề khác.

Môi trường:
- Hệ điều hành: Windows 10
- Java JDK: 19
- Maven: Apache Maven 3.6.3

Tải xuống mã nguồn test ở đây: https://github.com/l4yn3/micro_service_seclab

# Cài đặt CodeQL
CodeQL bao gồm một công cụ phân tích cú pháp và SDK.
- Công cụ phân tích cú pháp được sử dụng để phân tích các quy tắc mặc định của github hoặc quy tắc mà tự chúng ta custom. Mặc dù nó không phải là nguồn mở nhưng ta có thể tải xuống file binary trực tiếp từ trang web chính chủ. Freeee
- SDK: hoàn toàn là mã nguồn mở và chứa hầu hết các rule scan được tạo sẵn và chúng ta cũng có thể tự custom.

## Cài đặt Engine
- Đầu tiên, chọn bị trí cài đặt Codeql trên hệ thống, ví dụ: `/home/CodeQl`
- Sau đó, tải xuống file binary đã biên dịch về từ: https://github.com/github/codeql-cli-binaries/releases/tag/v2.17.2 giải nén và đưa vào thư mục `~/CodeQl`
- Thêm command vào biến môi trường:
```bash
export PATH=/Home/CodeQL/codeql:$PATH
```
- Nhập lệnh codeql nếu xuất hiện giao diện như sau thì cài đặt đã hoàn tất

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/2.png)

## Cài đặt SDK
- Sử dụng git để tải xuống bộ công cụ QL và cũng đặt nó trong thư mục `~/CodeQL`
```bash
cd ～/CodeQL&git clone https://github.com/Semmle/ql
```
=> như vậy, trong thư mục `~/CodeQL` chứa hai thư mục, thư mục công cụ (codeql) và thư mục SDK (ql)

## Cài đặt plug-in VsCode
Codeql cũng có thể sử dụng Visual Studio để chạy và debug các rule nên chúng ta có thể cài đặt plug-in của nó. Tìm kiếm trong phần Extension của vscode và nhấp vào cài đặt. 

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/3.png)

Sau đó ta cấu hình codeql với đường dẫn đã cài ở trên

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/4.png)

=> Đến đây ta đã thiết lập được môi trường cho Codeql

# Thử nghiệm `Hello world`
## Tạo cơ sở dữ liệu
Để kiểm tra xem môi trường vừa cài đặt có thể debug bình thường không, chúng ta sẽ triển khai một `Hello world` đơn giản.

Vì đối tượng mà CodeQL xử lý không phải là mã nguồn gốc mà là cơ sở dữ liệu có cấu trúc AST, nên trước tiên chúng ta cần chuyển đổi mã nguồn dự án thành mã mà CodeQL có thể hiểu được.

Lệnh tạo database:
```bash
codeql database create ~/CodeQL/databases/micro-service-seclab-database --language="java" --command="mvn clean install --file pom.xml" --source-root=~/CodeQL/micro-service-seclab/
```

Giải thích lệnh:
- `codeql database create ~/CodeQL/databases/micro-service-seclab-database`: là database ta muốn tạo
- `--language="java"`: là ngôn ngữ của mã nguồn
- `--command="mvn clean install --file pom.xml"`: Lệnh biên dịch. Vì Java là ngôn ngữ được biên dịch nên cần sử dụng lệnh. Nếu là python, javascript thì không cần cái này.
- `--source-root=~/CodeQL/micro-service-seclab/`: là đường dẫn tới folder lưu mã nguồn

Sau khi chạy lệnh trên, dự án sẽ được biên dịch trước, sau đó nó sẽ nhắc rằng database đã được tạo thành công.

## import database
Giống với SQL, khi thực hiện truy vấn QL, trước tiên chúng ta phải chỉ định cơ sở dữ liệu. Chúng ta import database vừa tạo bằng cách chọn thư mục `~/CodeQL/micro-service-seclab/`.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/5.png)

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/6.png)

## Viết query `hello world`
Để viết truy vấn QL, ta mở thư mục Visual Studio mà chúng ta đã bắt đầu tải xuống SDK, sau đó tạo một tệp mới `~/CodeQL/qldemo.ql`. Viết đoạn sau: `select "hello world"`.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/7.png)

=> Sau khi thực hiện như trên, nếu thấy có hello world xuất hiện thì thành công.

# Cú pháp cơ bản của CodeQL
Công cụ core của CodeQL không phải là mã nguồn mở, một trong những chức năng chính của nó là giúp ta chuyển đổi mã nguồn `micro-service-seclab` thành cơ sở dữ liệu mà CodeQL có thể hiểu được. 
Sau đó, ta cần viết query để lấy những gì mà ta muốn.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/8.png)

Vì các quy tắc (rule) của CodeQL là mã nguồn mở và các phần thư viện quy tắc, nên điều chúng ta có thể làm là viết các quy tắc QL phù hợp với logic nghiệp vụ của mình, sau đó sử dụng công cụ CodeQL để chạy các quy tắc của chúng ta và khám phá các lỗ hổng bảo mật trong quá trình debug.

## Cú pháp QL
Cú pháp truy vấn của CodeQL hơi giống với SQL.

```sql
import java

from int i
where i = 1
select i
```

dòng đầu tiên, ta giới thiệu thư viện class CodeQL, vì dự án ta đang phân tích là java nên nó cần thiết trong câu lệnh QL. 

`from int i` là ta đang định nghĩa một biến i, kiểu của nó là int => chúng ta sẽ lấy tất cả các dữ liệu kiểu int

`where i = 1`: nghĩa là khi i = 1 thì điều kiện được thỏa mãn.

`select i`: địa diện cho đầu ra của i

=> tóm lại, trong số các biến kiểu int , khi gặp biến có i = 1 thì in ra i. 

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/9.png)

Cú pháp:

```sql
from [datatype] var
where condition(var = something)
select var
```

## Thư viện lớp
Chúng ta đã đề cập ở trên rằng ta cần sử dụng công cụ CodeQL để chuyển đổi dự án thành cơ sở dữ liệu mà codeql có thể nhận ra. 

Mã AST trông như sau:

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/10.png)

Làm sao để hiểu nó ?
Ví dụ: chúng ta muốn lấy tất cả các phương thức trong Class, Method trong AST đại diện cho phương thức trong lớp. Nếu chúng ta muốn lấy tất cả các lệnh gọi phương thức, MethodAccess sẽ nhận tất cả các lệnh gọi phương thức.

Các thư viện lớp QL chúng ta thường sử dụng thường là:
- Method: Class này lấy tất cả các phương thức trong dự án hiện tại.
- MethodAccess: lệnh gọi MethodAccess nghĩa là nhận được tất cả các lệnh gọi phương thức trong dự án hiện tại.
- Parameter: Class Parameter lấy tất cả các tham số trong dự án hiện tại.

Kết hợp với cú pháp của QL, chúng ta cố gắng lấy tất cả các phương thức được xác định trong dự án `micro-service-seclab`:

```js
import java

from Method method
select method
```

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/11.png)

Tiếp theo, thử lọc kết quả thông qua một số phương thức được tích hợp trong class Method. Ví dụ: chúng ta lấy tên phương thức có tên là getStudent.

```js
import java

from Method method
where method.hasName("getStudent")
select method.getName(), method.getDeclaringType()
```

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/12.png)

- `Method.hasName()`: lấy tên của phương thức hiện tại
- `Method.getDeclaringType()`: lấy tên của class mà phương thức hiện tại thuộc về.

## Thuộc tính
Giống như SQL, nếu điều kiện truy vấn ở phần `where` quá dài trông rất khó quản lý. CodeQL cung cấp một cơ chế cho phép gói gọn các câu lệnh truy vấn dài thành các `function`.

Hàm này được gọi là `predicate` ???

Ví dụ: Viết lại query trên thành `predicate` như sau:

```js
import java
 
predicate isStudent(Method method) {
exists(|method.hasName("getStudent"))
}
 
from Method method
where isStudent(method)
select method.getName(), method.getDeclaringType()
```

Giải thích:
- `predicate` chỉ ra rằng phương thức hiện tại không có giá trị trả về.
- `Truy vấn con exists` là một cấu trúc cú pháp phổ biến trong predicate CodeQL. Nó trả về true/false dựa trên truy vấn con nội bộ để quyết định dữ liệu nào cần được lọc ra.

# Đặt source và sink
source và sink là gì ?

Trong lý thuyết kiểm thử bảo mật tự động hóa cho mã nguồn, có một khái niệm - bộ ba cốt lõi (source, sink và sanitizer)
* source: đề cập đến điểm đầu vào (input) của một chain lây nhiễm lỗ hổng. Ví dụ: hàm lấy dữ liệu từ tham số của HTTP request là một source rõ ràng nhất.
* sink: đề cập đến điểm thực thi của chain ô nhiễm lỗ hổng bảo mật, như lỗ hổng SQL injection. Hàm thực thi câu lệnh SQL cuối cùng là sink (chức năng này có thể được gọi là query hoặc exeSql hoặc các chức năng khác)
* sanitizer: hay còn gọi là sanitization function, nghĩa là trong toàn bộ chain dễ bị tổn thương, nếu có một Method chặn toàn bộ chuỗi lây nhiễm thì phương thức này gọi là sanitizer.

=> Chỉ khi source và sink tồn tại cùng lúc và liên kết từ source đến sink được mở thì điều đó có nghĩa là lỗ hổng bảo mật có tồn tại.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/13.png)

## Đặt source
Trong CodeQL chúng ta dùng
`override predicate isSource(DataFlow::Node src) {}`

Đây là phương thức dùng để thiết lập source

Vậy, trong bài lab của chúng ta , source là gì?
	Chúng ta đã sử dụng một framework SpringBoot , vì vậy source là tham số mã của tham số HTTP. Trong đoạn mã sau, source chính là username.

```java
@RequestMapping(value = "/one") public List<Student> one(@RequestParam(value = "username") Chuỗi tên người dùng) { return indexLogic.getStudent(username); 
}
```

Trong đoạn mã sau, source là `Student user(user)`. user thuộc kiểu `Student` điều này sẽ không bị ảnh hưởng.
```java
@PostMapping(value = "/object")
public List<Student> objectParam(@RequestBody Student user) {
    return indexLogic.getStudent(user.getUsername());
}
```

Trong ví dụ này, code chúng ta sẽ đặt Source là:
```java
override predicate isSource(DataFlow::Node src) { src instanceof RemoteFlowSource }
```
Đây là rule SDK tích hợp chứa các mục Source được sử dụng phổ biến nhất. SpringBoot mà chúng ta sử dụng cũng được bao gồm và chúng ta có thể sử dụng trực tiếp.

Lưu ý: Cú pháp instanceof là cú pháp do CodeQL cung cấp, chúng ta sẽ nói đến sau trong phần nâng cao của CodeQL.

## Đặt sink
Trong CodeQL chúng ta thiết lập `sink` bằng cách sử dụng:
```js
override predicate isSink(DataFlow::Node sink) {

  }
```

Trong trường hợp này, sink của chúng ta phải là Method tên là `query` , lệnh gọi phương thức (Method), vì vậy chúng ta đặt sink thành:

```js
override predicate isSink(DataFlow::Node sink) {
exists(Method method, MethodAccess call |
  method.hasName("query")
  and
  call.getMethod() = method and
  sink.asExpr() = call.getArgument(0)
)
}
```

Lưu ý: đoạn mã này sử dụng cú pháp truy vấn con exists, với định dạng là (Obj obj|somthing). Ý nghĩa của truy vấn trên là tìm điểm gọi của phương thức `query()` và đặt tham số đầu tiên của nó thành sink.

Trong bài lab của chúng ta, sink là:
```js
jdbcTemplate.query(sql, ROW_MAPPER);
```
Do lỗ hổng Injection mà chúng ta đã kiểm tra, lỗ hổng injection chỉ xảy ra khi source chảy vào phương thức sink này.

## Flow: luồng dữ liệu
Việc thiết lập source và sink tương đương với việc sửa chữa input và output , nhưng việc phần đầu và phần cuối này có kết nối được hay không sẽ quyết định có lỗ hổng bảo mật hay không!

Nếu một biến bị ô nhiễm có thể chảy đến một hàm nguy hiểm mà không gặp một trở ngại nào, điều đó có nghĩa là có một lỗ hổng bảo mật!!!

Công việc kết nối này sẽ được hoàn thành bởi công cụ CodeQL. Chúng ta xác định xem nó có được kết nối hay không bằng cách sử dụng các phương pháp
`config.hasFlowPath(source, sink)` 

Ví dụ: đoạn mã sau:
```js
from VulConfig config, DataFlow::PathNode source, DataFlow::PathNode sink
where config.hasFlowPath(source, sink)
select source.getNode(), source, sink, "source"
```

Chúng ta chuyển nó đến `config.hasFlowPath(source, sink)` đã xác định và hệ thống sẽ tự động giúp chúng ta xác định xem liệu có lỗ hổng hay không?

## Thử nghiệm với lỗ hổng
`config.hasFlowPath(source,sink)` trong CodeQL, chúng ta sử dụng phương thức `TaintTracking::Configuration` được cung cấp chính thức để xác định source và sink. Về việc phần giữa có được kết nối hay không , chúng ta sẽ sử dụng mã do CodeQL cung cấp để giúp chúng ta xử lý sau này.

```js
class VulConfig extends TaintTracking::Configuration {
  VulConfig() { this = "SqlInjectionConfig" }

  override predicate isSource(DataFlow::Node src) { src instanceof RemoteFlowSource }

  override predicate isSink(DataFlow::Node sink) {
    exists(Method method, MethodAccess call |
      method.hasName("query")
      and
      call.getMethod() = method and
      sink.asExpr() = call.getArgument(0)
    )
  }
}
```

Cú pháp CodeQL tương tự Java và `extends` đại diệm cho Class cha tích hợp `TaintTracking::Configuration` 
Class này là class chung phổ biến được cung cấp chính thức để phân tích luồng dữ liệu, cung cấp nhiều phương thức liên quan đến phân tích luồng dữ liệu, chẳng hạn như `isSource (xác định source)`, `isSink (xác định Sink)`  

`src instanceof RemoteFlowSource ` có nghĩa là src phải thuộc loại `RemoteFlowSource` . Trong `RemoteFlowSource` , bản chính thức cung cấp định nghĩa source rất đầy đủ, đã được bao gồm trong source SpringBoot mà chúng ta đã sử dụng trong bài lab.

Bản `demo.ql` phiên bản đầy đủ đầu tiên như sau:
```js
/**
 * @id java/examples/vuldemo
 * @name Sql-Injection
 * @description Sql-Injection
 * @kind path-problem
 * @problem.severity warning
 */

import java
import semmle.code.java.dataflow.FlowSources
import semmle.code.java.security.QueryInjection
import DataFlow::PathGraph

class VulConfig extends TaintTracking::Configuration {
	VulConfig() { this = "SqlInjectionConfig" }

	override predicate isSource(DataFlow::Node src) { src instanceof RemoteFlowSource }
	override predicate isSink(DataFlow::Node sink) {
		exists(Method method, MethodAccess call |
			method.hasName("query")
			and
			call.getMethod() = method and 
			sink.asExpr() = call.getArgument(0)
			
			)
	}
}

from VulnConfig config, DataFlow::PathNode source, DataFlow::PathNode sink
where config.hasFlowPath(source, sink)
select source.getNode(), source, sink, "source"
```

Lưu ý: comment trên khác với các ngôn ngữ khác và không thể xóa. Nó là một phần của chương trình, vì khi chúng ta tạo báo cáo thử nghiệm, tên, mô tả và các thông tin khác trong comment này sẽ được ghi vào báo cáo kiểm tra.

Bằng query trên, ta đã nhận được một số Flow cho kết quả lỗ hổng tồn tại.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/14.png)

## Xử lý kết quả dương tính giả
Từ kết quả trên, nhận thấy có một vài kết quả dương tính giả trong đó.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/15.png)

Kiểu tham số của phương thức này là List`<Long>` , do đó không có khả năng xảy ra lỗ hổng Injection ở đây.
Điều này cho thấy rằng trong các quy tắc của chúng ta, kết quả dương tính giả sẽ xảy ra đối với các kiểu List`<Long>` và thậm chí là List`<Interger>` , đồng thời source bao gồm nhầm các tham số dạng này.

Chúng ta cần thực hiện các bước để loại bỏ kết quả dương tính giả này.

Đây là phương thức `isSanitizer`

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/16.png)

`TaintTracking::ConfigurationisSanitizer` : là một phương thức được cung cấp bởi các class CodeQL. Nguyên bản chức năng của nó là:
`override predicate isSanitizer(DataFlow::Node node) {}`

Trong các quy tắc mặc định đi kèm với CodeQL, nó sẽ đánh giá xem Node hiện tại có phải là kiểu cơ bản hay không. 

```js
override predicate isSanitizer(DataFlow::Node node) {  
node.getType() instanceof PrimitiveType or  
node.getType() instanceof BoxedType or  
node.getType() instanceof NumberType  
}
```

Điều đó có nghĩa là nếu Node hiện tại thuộc kiểu cơ bản được đề cập ở trên thì chuỗi ô nhiễm này sẽ được lọc và chặn , lỗ hổng sẽ không tồn tại ở đây.

Vì CodeQL phát hiện phương pháp chèn SQL `isSanitizer` nên  nó chỉ đánh giá kiểu cơ bản và không đánh giá kiểu tổng hợp này, điều này gây ra vấn đề dương tính giả.

Sau đó, chúng ta chỉ cần thêm kiểu tổng hợp này vào phương thức `isSanitizer` để loại bỏ kết quả dương tính giả

```js
override predicate isSanitizer(DataFlow::Node node) {
    node.getType() instanceof PrimitiveType or
    node.getType() instanceof BoxedType or
    node.getType() instanceof NumberType or
    exists(ParameterizedType pt| node.getType() = pt and pt.getTypeArgument(0) instanceof NumberType )
  }
```

Ý nghĩa của đoạn mã trên là: Nếu kiểu của Node hiện tại là kiểu cơ bản : kiểu số hoặc kiểu chung như (List,..) thì luồng dữ liệu sẽ bị cắt, luồng dữ liệu sẽ được coi là bị gián đoạn và việc phát hiện sẽ không tiếp tục.

Thực hiện lại truy vấn, chúng ta nhận thấy kết quả dương tính giả vừa rồi đã được loại bỏ thành công.

## Giải quyết âm tính giả
Có thể thấy, mã nguồn sau chứa lỗ hổng bảo mật nhưng CodeQL lại không phát hiện ra.

```java
public List<Student> getStudentWithOptional(Optional<String> username) {
        String sqlWithOptional = "select * from students where username like '%" + username.get() + "%'";
        //String sql = "select * from students where username like ?";
        return jdbcTemplate.query(sqlWithOptional, ROW_MAPPER);
    }
```

Về lý thuyết, âm tính giả là không thể chấp nhận được. Nếu xảy ra dương tính giả, chúng ta cũng có thể giải quyết thông qua sàng lọc thủ công, nhưng âm tính giả bị bỏ sót sẽ khiến nhiều lỗ hổng lây lan qua liên kết tiếp theo dẫn tới lỗ hổng bảo mật.

Vậy giải quyết nó như nào? => Câu trả lời được tìm thấy là sử dụng phương thức `isAdditionalTainStep`. Có nghĩa là nếu quá trình quét bị hỏng thì buộc nó phải kết nối lại.

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/images-learn/Learn-2022-10-10-Learn-Codeql/17.png)

`isAdditionalTaintStep` : là phương thức được cung cấp bởi class CodeQL `TaintTracking::Configuration` và nguyên mẫu của nó là 
`override predicate isAdditionalTaintStep(DataFlow::Node node1, DataFlow::Node node2) {}`

Chức năng chính: buộc Node A có thể kiểm soát được đến Node B và sau đó Node B trở thành Node có thể kiểm soát.

Sau nhiều lần kiểm tra, ta xác định rằng bước username.get() đã bị hỏng. Có lẽ vì việc sử dụng tùy chọn không có trong thư viện cú pháp CodeQL.

Vì vậy, ở đây chúng ta buộc username chuyển sang username.get() để username.get() có thể kiểm soát được. Lúc này quá trình tiếp tục tại node username.get().

```java
/**
 * @id java/examples/vuldemo
 * @name Sql-Injection
 * @description Sql-Injection
 * @kind path-problem
 * @problem.severity warning
 */

import java
import semmle.code.java.dataflow.FlowSources
import semmle.code.java.security.QueryInjection
import DataFlow::PathGraph

predicate isTaintedString(Expr expSrc, Expr expDest) {
    exists(Method method, MethodAccess call, MethodAccess call1 | expSrc = call1.getArgument(0) and expDest=call and call.getMethod() = method and method.hasName("get") and method.getDeclaringType().toString() = "Optional<String>" and call1.getArgument(0).getType().toString() = "Optional<String>"  )
}

class VulConfig extends TaintTracking::Configuration {
  VulConfig() { this = "SqlInjectionConfig" }

  override predicate isSource(DataFlow::Node src) { src instanceof RemoteFlowSource }

  override predicate isSanitizer(DataFlow::Node node) {
    node.getType() instanceof PrimitiveType or
    node.getType() instanceof BoxedType or
    node.getType() instanceof NumberType or
    exists(ParameterizedType pt| node.getType() = pt and pt.getTypeArgument(0) instanceof NumberType )
  }

  override predicate isSink(DataFlow::Node sink) {
    exists(Method method, MethodAccess call |
      method.hasName("query")
      and
      call.getMethod() = method and
      sink.asExpr() = call.getArgument(0)
    )
  }`override predicate isAdditionalTaintStep(DataFlow::Node node1, DataFlow::Node node2) {     isTaintedString(node1.asExpr(), node2.asExpr())   } }   from VulConfig config, DataFlow::PathNode source, DataFlow::PathNode sink where config.hasFlowPath(source, sink) select source.getNode(), source, sink, "source"`
```

Lưu ý: ở trên, chúng ta đã triển khai một predicate `isTaintedString` và sử dụng truy vấn con exists để triển khai `Optional<String> username` liên kết bắt buộc `Optional<String> username.get()` 

Cuối cùng ta đã giải quyết dc hết vấn đề.

## Vấn đề về lombok
`lombok` là một thư viện Java rất phổ biến. Nó sử dụng các chú thích đơn giản để giúp chúng ta dễ dàng hóa và loại bỏ một số đoạn mã Java cần thiết nhưng phức tạp.

Hãy xem xét một ví dụ mã Java:
```java
package com.l4yn3.microserviceseclab.data;

public class Student {
    private int id;
    private String username;
    private int sex;
    private int age;

    public void setId(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public int getAge() {
        return age;
    }

    public void setSex(int sex) {
        this.sex = sex;
    }

    public int getSex() {
        return sex;
    }
}
```

lombok là một thư viện Java rất phổ biến. Nó sử dụng các chú thích đơn giản để giúp chúng ta dễ dàng hóa và loại bỏ một số đoạn mã Java cần thiết nhưng phức tạp.

Hãy xem xét một ví dụ mã Java:

java

package com.l4yn3.microserviceseclab.data;

public class Student {
    private int id;
    private String username;
    private int sex;
    private int age;

    public void setId(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public int getAge() {
        return age;
    }

    public void setSex(int sex) {
        this.sex = sex;
    }

    public int getSex() {
        return sex;
    }
}

Ở đây, chúng ta phải viết thủ công các phương thức getter và setter cho từng thuộc tính, điều này rất tốn thời gian và tẻ nhạt. Tuy nhiên, với chú thích của Lombok, chúng ta có thể loại bỏ công việc này.

Mã dưới đây tương đương với mã trên:
```java
package com.l4yn3.microserviceseclab.data;
import lombok.Data;

@Data
public class Student {
    private int id;
    private String username;
    private int sex;
    private int age;
}
```

Tuy nhiên, do cách Lombok triển khai nên CodeQL không thể lấy được mã do Lombok tự động tạo ra. Điều này dẫn đến việc không thể phát hiện được lỗ hổng bảo mật trong mã sử dụng Lombok.

May mắn thay, đã có người đưa ra giải pháp cho vấn đề này trong vấn đề chính thức của CodeQL [tại đây](https://github.com/github/codeql/issues/4984#:~:text=Unfortunately%20Lombok%20does%20not%20work%20with%20the%20CodeQL,the%20source%20files%20before%20running%20CodeQL%20as%20follows%3A).

Đoạn mã sau giúp loại bỏ chú thích Lombok và khôi phục mã Java của các phương thức getter và setter để CodeQL có thể phân tích mã một cách chính xác và phát hiện lỗ hổng bảo mật:


```bash
# tải một bản sao của lombok.jar
wget https://projectlombok.org/downloads/lombok.jar -O "lombok.jar"
# chạy "delombok" trên các tệp nguồn và ghi các tệp được tạo vào một thư mục có tên là "delombok"
java -jar "lombok.jar" delombok -n --onlyChanged . -d "delombok"
# xóa các bình luận "generated by"
find "delombok" -name '*.java' -exec sed '/Generated by delombok/d' -i '{}' ';'
# xóa bất kỳ câu lệnh import nào còn sót lại
find "delombok" -name '*.java' -exec sed '/import lombok/d' -i '{}' ';'
# sao chép các tệp đã delombok vào thư mục gốc
cp -r "delombok/." "./"
# xóa thư mục "delombok"
rm -rf "delombok"
```

Chức năng của đoạn mã trên là loại bỏ các chú thích Lombok trong mã và khôi phục các phương thức getter và setter trong mã Java, để quá trình CodeQL có thể diễn ra suôn sẻ và phát hiện được các lỗ hổng bảo mật.

# Tip ghi nhớ
## General
`.getASupertype() ` : lấy các `supertype` của Obj hiện tại
* `.getType()` : lấy kiểu của Obj
* `.getDeclaringType()` : trả về Object class hoặc interface mà Object đó được định nghĩa hoặc khai báo bên trong. Cho phép xác định xem thành phần đó thuộc về class hoặc interface nào trong cây kế thừa của source code.
```java
import java

from Method method
select method, method.getDeclaringType() as declaringType
/* tìm tất cả Method trong code và trích xuất class mà mỗi phương thức được khai báo trong đó.*/
```
* `TypeSerializable` : nghĩa là Obj hiện tại triển khai `implement` là class `Serializable`
```java
Ex: instanceof TypeSerializable
```
* `ClassInstanceExpr` : xác các thể hiện `instance` của một class đang xử lý
* `MethodAccess`: biểu thị việc truy cập một phương thức (method) trong mã nguồn. Giúp phân tích và hiểu cách các phương thức được gọi và sử dụng.
```java
import java

from MethodAccess methodAccess
where
  methodAccess.getTarget().getName() = "print"
  /* Kiểm tra nếu tên phương thức là "print" */
select methodAccess
```
Ví dụ này, chúng ta tìm tất cả các `MethodAccess` nơi mà phương thức `print` được gọi.
* `.fromSource()`: giới hạn Obj đang xử lý chỉ xuất phát từ mã nguồn. Truy vấn chỉ áp dụng cho các Obj trong mã nguồn.
* `.hasQualifiedName(namespace, name)` : Phương thức này thường được sử dụng khi bạn muốn tìm kiếm hoặc xác định các thành phần trong mã nguồn có tên cụ thể, chẳng hạn như tên của một lớp, giao diện, phương thức, biến, hoặc bất kỳ điều gì có tên định danh.
	- `namespace`: Không gian chứa tên cần tìm kiếm thường là tên package
	- `name`: tên Object cần tìm kiếm
* `.hasName(name)` : kiểm tra xem một Object có tên là name hay không

## Lệnh thực thi CLI
## Lệnh CodeQL
Tạo database
* `codeql database create databaseName --source-root=D:/xxljob --language=java`
Cập nhật database
* `codeql database upgrade databaseName`
Quét CLI
* `codeql database analyze databasePath codeql-repo/java --format=csv --output=result.csv`
codeql-repo/java: quy tắc quét java
--format: định dạng kết quả đầu ra
--output: đường dẫn ra file kết quả

* run nhanh tiết kiệm RAM
```bash
./codeql/codeql database analyze ./databases/halo-database ql/java/ql/src/codeql-suites/java-security-extended.qls --format=csv --output=results.csv --ram 3000 --threads=2 --min-disk-free=1024  
```

* command run các app gradlew
```bash
--command="./gradlew compileJava" 
```

## Một số mẫu custom Java
* Mẫu tìm các Class implement class `Serializable`
```java
import java

from Class cl
where
cl.getASupertype() instanceof TypeSerializable
and
cl.fromSource()

select cl
```

* Mẫu tìm mã thực hiện khởi tạo một class với tên
```java
import java
/* 找到实例化User的类 */
class MyUser extends RefType{
    MyUser(){
        this.hasQualifiedName("com.summersec.shiroctf.bean", "User")
    }
}

from ClassInstanceExpr clie
where 
    clie.getType() instanceof MyUser
select clie
```

* Mẫu tìm class có tên là `deserialize`
```java
import java

class Deserialize extends RefType {

Deserialize() {

this.hasQualifiedName("com.summersec.shiroctf.Tools", "Tools")

}

}


class DeserializeTobytes extends Method {

DeserializeTobytes() {

this.getDeclaringType() instanceof Deserialize

and

this.hasName("deserialize")

}

}

from DeserializeTobytes des
select des
```



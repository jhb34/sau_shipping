<template>
  <div
    style="
      background-color: #eeeeee;
      height: 100vh;
      background-attachment: scroll;
      font-size: 2vh;
    "
  >
    <div
      style="
        background-color: #067dd7;
        color: azure;
        height: 6vh;
        font-size: 3vh;
        font-weight: 800;
        padding: 1vh;
      "
    >
      PRODUCT SCAN
      <font-awesome-icon
        icon="fa-solid fa-rotate"
        class="float-end"
        style="height: 4vh"
        @click="refresh"
      />
      <font-awesome-icon
        icon="fa-solid fa-left-long"
        class="float-start"
        @click="goToHome"
        style="height: 4vh"
      />
    </div>
    <div class="container">
      <i class="bi-alarm" style="font-size: 2rem; color: cornflowerblue"></i>
      <div class="input-group mt-2">
        <span class="input-group-text col-3" style="font-size: 2vh"
          >Item No.</span
        >
        <div class="form-control">
          <span style="font-size: 2vh">{{ input.ITMNO }}</span>
        </div>
      </div>
      <div class="input-group mt-1">
        <span class="input-group-text col-3 text-center" style="font-size: 2vh"
          >Pallet No.</span
        >
        <div class="form-control">
          <span style="font-size: 2vh">{{ input.TMP_SERNO }}</span>
        </div>
      </div>
      <p>scan: {{ barcode }}</p>
      <p>input: {{ input }}</p>
      <p>selectedData: {{ selectedData }}</p>
      <button @click="barcodeChk">process</button>
      <button @click="barcodeClear">clear</button>
      <div class="input-group mt-2">
        <input
          type="text"
          placeholder="Scan Here"
          v-model="scanValue"
          @input="change"
          class="form-control"
          @keyup.enter="onenter"
        />
      </div>
      <div class="mt-2" style="height: 50vh; overflow: auto">
        <table class="table table-hover">
          <thead class="table-primary">
            <tr style="position: sticky; top: 0">
              <th>Part Label Number</th>
              <th>Scan Time</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="a in data"
              :key="a"
              @click="goToDetail(a.ITMNO, a.SAL_YMD, a.TRAILER_NO)"
            >
              <td>{{ a.PART_LABEL }}</td>
              <td>{{ a.SCAN_DTTM }}</td>
              <!-- <td>
                <span v-if="a.NOW_ST === '0'" class="badge bg-warning text-dark"
                  >Ready</span
                >
                <span
                  v-else-if="a.NOW_ST === a.ORD_BOX"
                  class="badge text-bg-danger"
                  >Scanning</span
                >
                <span v-else class="badge text-bg-secondary">Complete</span>
              </td> -->
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      scanValue: '',
      barcode: '',
      scanData: [],
      selectedData: [],
      input: {},
      data: []
    }
  },
  setup() {},
  created() {
    this.input = this.$route.query
    console.log(this.$route.query)
  },
  mounted() {
    this.getProductlist()
  },
  unmounted() {},
  methods: {
    onenter() {
      alert('enter')
    },
    change() {
      // const asciiValues = [];
      // for (let i = 0; i < this.scannerData.length; i++) {
      //   const charCode = this.scannerData.charCodeAt(i);
      //   asciiValues.push(charCode);
      // }

      for (let i = 0; i < this.scanValue.length; i++) {
        const charCode = this.scanValue.charCodeAt(i)
        if (charCode === 29) {
          this.barcode += '{GS}'
        } else if (charCode === 30) {
          this.barcode += '{RS}'
        } else if (charCode === 4) {
          this.barcode += '{EOT}'
        } else if (charCode === 13) {
          alert('13')
        } else if (charCode === 32) {
          alert('32')
        } else {
          this.barcode += String.fromCharCode(charCode)
        }
      }
    },
    barcodeClear() {
      this.barcode = ''
      this.scanValue = ''
    },
    async getData() {
      const r = await this.$post('/getlist', {
        params: [this.input.date, this.input.trail, this.input.cust]
      })
      console.log('getData', r)
      this.data = r.data.recordset
    },
    async getProductlist() {
      const today1 = this.getDate1(new Date())
      const today2 = this.getDate2(new Date())
      const today3 = this.getDate3(new Date())
      const r = await this.$post('/getproductlist', {
        params: this.input.TMP_SERNO
      })
      if (r === undefined) {
        alert('Error at chkprdno')
        return
      }
      console.log('getproductlist', r)
      if (r.data.recordset.length > 1) {
        await this.inserthist([
          {
            SAL_YMD: this.input.SAL_YMD,
            TRAILER_NO: this.input.TRAILER_NO,
            CUST_CD: this.input.CUST_CD,
            ASN_NO: this.input.ASN_NO
          },
          {
            TMP_ITMNO: this.input.TMP_ITMNO,
            TMP_SERNO: this.input.TMP_SERNO,
            TMP_QTY: this.input.TMP_QTY
          },
          today1,
          today2,
          1
        ])
        if (this.input.ORD_QTY > this.input.SCAN_QTY + this.input.TMP_QTY) {
          await this.updateorder([
            {
              SAL_YMD: this.input.SAL_YMD,
              TRAILER_NO: this.input.TRAILER_NO,
              ITMNO: this.input.ITMNO
            },
            this.input.SCAN_QTY + this.input.TMP_QTY,
            this.input.SCAN_BOX + 1,
            today3,
            1
          ])
        } else if (
          (this.input.ORD_QTY = this.input.SCAN_QTY + this.input.TMP_QTY)
        ) {
          await this.updateorder([
            {
              SAL_YMD: this.input.SAL_YMD,
              TRAILER_NO: this.input.TRAILER_NO,
              ITMNO: this.input.ITMNO
            },
            this.input.SCAN_QTY + this.input.TMP_QTY,
            this.input.SCAN_BOX + 1,
            today3,
            2
          ])
        }
        this.$router.push({
          path: '/palletscan',
          query: {
            trail: this.input.TRAILER_NO,
            date: this.input.SAL_YMD,
            cust: this.input.CUST_CD
          }
        })
      } else {
        this.data = r.data.recordset
      }
    },
    async chkDup(a) {
      const r = await this.$post('/chkdup', { params: a })
      console.log('chkDup', r)
      if (r.data.recordset.length === 0) {
        console.log('fun', false)
        return false
      } else {
        console.log('fun', true)
        return true
      }
    },
    async chkPO(a) {
      const r = await this.$post('/chkpo', { params: a })
      console.log('chkPO', r)
      if (r.data.recordset.length === 0) {
        console.log('fun', false)
        return true
      } else {
        console.log('fun', true)
        return false
      }
    },
    async chkITMNO(a) {
      const r = await this.$post('/chkitmno', { params: a })
      console.log('chkITMNO', r)
      if (r.data.recordset.length === 0) {
        return true
      } else {
        return false
      }
    },
    async chkALC(a) {
      const r = await this.$post('/chkalc', { params: a })
      console.log('chkITMNO', r)
      if (r.data.recordset.length === 0) {
        return true
      } else {
        return false
      }
    },
    async chkprdno(a) {
      const r = await this.$post('/chkprdno', { params: a })
      console.log('chkITMNO', r)
      if (r === undefined) {
        alert('Error at chkprdno')
        return
      }
      if (r.data.recordset.length > 0) {
        return true
      } else {
        return false
      }
    },
    async isShaft(a) {
      const r = await this.$post('/isshaft', { params: a })
      console.log('isshaft', r)
      if (r === undefined) {
        alert('Error at isShaft')
        return
      }
      if (r.data.recordset.length > 0) {
        return true
      } else {
        return false
      }
    },
    async inserthist(a) {
      const r = await this.$post('/inserthist', { params: a })
      console.log('inserthist', r)
      if (r === undefined) {
        alert('Error at inserthist')
      }
    },
    async insertproduct(a) {
      const r = await this.$post('/insertproduct', { params: a })
      console.log('insertproduct', r)
      if (r === undefined) {
        alert('Error at insertproduct')
      }
    },
    async updateorder(a) {
      const r = await this.$post('/updateorder', { params: a })
      console.log('updateorder', r)
      if (r === undefined) {
        alert('Error at updateorder')
      }
    },
    goToDetail(itm, date, trail) {
      this.$router.push({ path: '/scandetail', query: { itm, date, trail } })
    },
    goToHome() {
      this.$router.push({
        path: '/'
      })
    },
    refresh() {
      location.reload()
    },
    getDate1(a) {
      const pad2 = (n) => (n < 10 ? '0' : '') + n
      return (
        a.getFullYear() +
        pad2(a.getMonth() + 1) +
        pad2(a.getDate()) +
        pad2(a.getHours()) +
        pad2(a.getMinutes()) +
        pad2(a.getSeconds())
      )
    },
    getDate3(a) {
      const pad2 = (n) => (n < 10 ? '0' : '') + n
      return (
        a.getFullYear() +
        '-' +
        pad2(a.getMonth() + 1) +
        '-' +
        pad2(a.getDate()) +
        ' ' +
        pad2(a.getHours()) +
        ':' +
        pad2(a.getMinutes()) +
        ':' +
        pad2(a.getSeconds())
      )
    },
    getDate2(a) {
      return (
        25569.0 +
        (a.getTime() - a.getTimezoneOffset() * 60 * 1000) /
          (1000 * 60 * 60 * 24)
      )
    },
    async barcodeChk() {
      let PRD_ITMNO = ''
      let PRD_ALC = ''
      let PRD_NO = ''
      let PALLET_ITMNO = ''
      const scanValue = this.barcode.toUpperCase()
      // const scanValue = this.scanValue.toUpperCase()
      // 날짜변환
      const today1 = this.getDate1(new Date())
      const today2 = this.getDate2(new Date())
      const today3 = this.getDate3(new Date())
      console.log('today1', today1)
      console.log('today2', today2)
      console.log('today3', today3)
      alert(scanValue.slice(0, 7))
      if (scanValue.slice(0, 7) === '[)>{RS}') {
        const datas = scanValue.split('{GS}')
        alert(datas)
        for (const a of datas) {
          if (a.slice(0, 1) === 'P') {
            PRD_ITMNO = a.slice(1)
            alert(PRD_ITMNO)
            PALLET_ITMNO = this.input.TMP_ITMNO.replace('-', '')
            alert(PALLET_ITMNO)
            // 제품아이템번호가 파렛트 아이템번호와 같은지 체크
            if (PRD_ITMNO !== PALLET_ITMNO) {
              alert(
                'No ITMNO Match - product itmno is different from pallet itmno'
              )
              this.refresh()
              return
            }
          } else if (a.slice(0, 1) === 'S') {
            PRD_ALC = a.slice(1)
            alert(PRD_ALC)
            const PRD_CODE = PRD_ALC.slice(0, 4)
            let prdno = this.input.TMP_ITMNO
            if (this.input.TMP_CUST === 'S1301') {
              prdno = this.input.TMP_ITMNO + 'K'
            }
            // Label QTY 체크
            if (await this.chkALC([prdno, PRD_CODE])) {
              alert('ALC Code Error - please check Product ALC Code')
              this.refresh()
              return
            }
          } else if (a.slice(0, 1) === 'T') {
            PRD_NO = a.slice(1)
            alert(PRD_NO)
          }
        }
        const productNO = PRD_ALC + PRD_NO
        if (await this.chkprdno(productNO)) {
          alert('Duplicate - this product already scanned')
          this.refresh()
          return
        }
        await this.insertproduct([
          this.input.TMP_SERNO,
          productNO,
          PALLET_ITMNO,
          PRD_ITMNO,
          today2
        ])
        this.refresh()
        // let selectedData = this.data.filter((a) => a.ITMNO === TMP_ITMNO)
        // console.log('list data', selectedData)
        // // 스캔아이템 번호가 쉬핑오더 리스트에 있는지 체크
        // if (selectedData.length === 0) {
        //   alert('Not in List - scan Item does not match with Shipping Order')
        //   this.refresh()
        //   return
        // }
        // // 리스트 데이터를 selectedData에 저장
        // selectedData = selectedData[0]
        // console.log(selectedData.ASN_NO)

        // // Overcharge 체크
        // if (selectedData.ORD_QTY < selectedData.SCAN_QTY + tempData.TMP_QTY) {
        //   await this.inserthist([selectedData, tempData, today1, today2, 2])
        //   alert('Over Charge - please check Scan QTY')
        //   this.refresh()
        //   return
        // }
        // // ASN No 체크
        // if (selectedData.ASN_NO === '') {
        //   await this.inserthist([selectedData, tempData, today1, today2, 3])
        //   alert('NO ASN - please check Shipping Order')
        //   this.refresh()
        //   return
        // }
        // // Duplicate 체크
        // if (await this.chkDup(tempData.TMP_SERNO)) {
        //   await this.inserthist([selectedData, tempData, today1, today2, 4])
        //   alert('Duplicate - this pallet is already scanned')
        //   this.refresh()
        //   return
        // }
        // // Customer 체크
        // if (selectedData.CUST_CD !== tempData.TMP_CUST) {
        //   await this.inserthist([selectedData, tempData, today1, today2, 5])
        //   alert('Customer not match')
        //   this.refresh()
        //   return
        // }
        // // 제품바코드 체크
        // // if (await this.isShaft([tempData, 'A'])) {
        // //   this.$refs.btnModal.click()
        // // if (await this.chkProduct()) {
        // //   console.log('hello')
        // // } else {
        // //   await this.inserthist([selectedData, tempData, today1, today2, 6])
        // //   alert('Product Barcode Error - please check product')
        // //   return
        // // }
        // // }
        // // 고객사PO 체크
        // if (await this.chkPO(selectedData)) {
        //   await this.inserthist([selectedData, tempData, today1, today2, 7])
        //   alert('PO not match')
        //   this.refresh()
        //   return
        // }
        // console.log('chk all clear')
        // // await this.inserthist([selectedData, tempData, today1, today2, 1])
        // // if (selectedData.ORD_QTY > selectedData.SCAN_QTY + tempData.TMP_QTY) {
        // //   await this.updateorder([
        // //     selectedData,
        // //     selectedData.SCAN_QTY + tempData.TMP_QTY,
        // //     selectedData.SCAN_BOX + 1,
        // //     today3,
        // //     1
        // //   ])
        // // } else if (
        // //   (selectedData.ORD_QTY = selectedData.SCAN_QTY + tempData.TMP_QTY)
        // // ) {
        // //   await this.updateorder([
        // //     selectedData,
        // //     selectedData.SCAN_QTY + tempData.TMP_QTY,
        // //     selectedData.SCAN_BOX + 1,
        // //     today3,
        // //     2
        // //   ])
        // // }
        // this.scanValue = ''
        // // this.refresh()
      } else {
        alert('Label Error - please check pallet label')
        console.log('no', this.scanValue.slice(0, 7))
        this.scanValue = ''
      }
    }
  }
}

// {/* <input type="text" id="tacos" />
//     <button onclick="f()">code</button>
//       let barcode = "";
//       let barcode1 = "";
//       let barcode2 = "";
//       document
//         .getElementById("tacos")
//         .addEventListener("keypress", function (e) {
//           // if (e.charCode === 29) {
//           //   barcode += "{GS}";
//           // } else if (e.charCode === 30) {
//           //   barcode += "{RS}";
//           // } else if (e.charCode === 4) {
//           //   barcode += "{EOT}";
//           // } else if (e.charCode === 13) {
//           //   return;
//           // } else if (e.charCode === 32) {
//           //   return;
//           // } else {
//           //   barcode += String.fromCharCode(e.charCode);
//           // }
//           // barcode1 += e.key;
//           // barcode2 += String.fromCharCode(e.charCode);
//           console.log(e.charCode);
//           console.log(e.key);
//           console.log(String.fromCharCode(e.charCode));
//         });
//       function f() {
//         console.log(barcode);
//         // console.log(barcode1);
//         // console.log(barcode2);
//       }
</script>

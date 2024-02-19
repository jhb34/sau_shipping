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
      PALLET SCAN
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
      <div class="input-group mt-2" @change="setDate">
        <span class="input-group-text col-3" style="font-size: 2vh">Date</span>
        <div class="form-control">
          <span style="font-size: 2vh"
            >{{ input.date.substring(0, 4) }} /
            {{ input.date.substring(4, 6) }} /
            {{ input.date.substring(6, 9) }}</span
          >
        </div>
      </div>
      <div class="input-group mt-1">
        <span class="input-group-text col-3 text-center" style="font-size: 2vh"
          >Trailer No.</span
        >
        <div class="form-control">
          <span style="font-size: 2vh">{{ input.trail }}</span>
        </div>
      </div>
      <p>scan: {{ scanValue }} <button @click="barcodeChk">a</button></p>
      <div class="input-group mt-1" v-if="allchecked">
        <span class="input-group-text col-4 text-center" style="font-size: 2vh"
          >Container No.</span
        >
        <input type="text" class="form-control" v-model="containernumber" />
        <button
          class="btn btn-outline-secondary"
          @click="savecontainer"
          :disabled="containernumber === ''"
        >
          Save
        </button>
      </div>
      <div class="input-group mt-2" v-else>
        <input
          type="text"
          placeholder="Scan Here"
          v-model="scanValue"
          class="form-control"
        />
      </div>
      <p>{{ allchecked }}</p>
      <p>{{ containernumber }}</p>
      <div class="mt-2" style="height: 50vh; overflow: auto">
        <table class="table table-hover">
          <thead class="table-primary">
            <tr style="position: sticky; top: 0">
              <th>ASN Number</th>
              <th>Item Number</th>
              <th>Order Box</th>
              <th>Order Qty</th>
              <th>Scan Box</th>
              <th>Scan HM</th>
              <th>Scan Qty</th>
              <th>Now ST</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="a in data"
              :key="a"
              @click="goToDetail(a.ITMNO, a.SAL_YMD, a.TRAILER_NO)"
            >
              <td>{{ a.ASN_NO }}</td>
              <td>{{ a.ITMNO }}</td>
              <td>{{ a.ORD_BOX }}</td>
              <td>{{ a.ORD_QTY }}</td>
              <td>{{ a.SCAN_BOX }}</td>
              <td>{{ a.SCAN_HM }}</td>
              <td>{{ a.SCAN_QTY }}</td>
              <td>{{ a.NOW_ST }}</td>
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
      input: {},
      data: [],
      allchecked: true,
      containernumber: ''
    }
  },
  setup() {},
  created() {
    this.input = this.$route.query
  },
  mounted() {
    this.getData()
  },
  unmounted() {},
  methods: {
    async chkst() {
      this.data.forEach((a) => {
        console.log(a)
        if (a.NOW_ST !== '2') {
          this.allchecked = false
        }
      })
    },
    async savecontainer() {
      const yes = confirm('Do you want to save container number?')
      if (yes) {
        await this.updatecontainer()
      }
    },
    async getData() {
      const r = await this.$post('/getlist', {
        params: [this.input.date, this.input.trail, this.input.cust]
      })
      console.log('getData', r)
      this.data = r.data.recordset
      await this.chkst()
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
    async isShaft(a) {
      const r = await this.$post('/isshaft', { params: a })
      console.log('isshaft', r)
      if (r.data.recordset.length > 0) {
        return true
      } else {
        return false
      }
    },
    async chkProduct(a) {},
    async inserthist(a) {
      const r = await this.$post('/inserthist', { params: a })
      console.log('inserthist', r)
    },
    async updateorder(a) {
      const r = await this.$post('/updateorder', { params: a })
      console.log('updateorder', r)
    },
    async updatecontainer() {
      const con = this.containernumber.trim()
      const r = await this.$post('/updatecontainer', {
        params: [con, this.input]
      })
      console.log('updatecontainer', r)
    },
    goToProduct(a, b) {
      this.$router.push({
        path: '/productscan',
        query: { ...a, ...b }
      })
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
      let TMP_DATE = ''
      let TMP_ITMNO = ''
      let TMP_QTY = ''
      let TMP_SERNO = ''
      let TMP_CUST = ''
      const scanValue = this.scanValue.toUpperCase()
      // const scanValue = this.scanValue.toUpperCase()
      const tempData = {}
      // 날짜변환
      const today1 = this.getDate1(new Date())
      const today2 = this.getDate2(new Date())
      const today3 = this.getDate3(new Date())
      console.log('today1', today1)
      console.log('today2', today2)
      console.log('today3', today3)
      if (scanValue.slice(0, 6) === '[)>*06') {
        const datas = scanValue.split(':')
        for (const a of datas) {
          if (a.slice(0, 1) === 'P') {
            TMP_ITMNO = a.slice(1)
            TMP_ITMNO = TMP_ITMNO.slice(0, 5) + '-' + TMP_ITMNO.slice(5)
            // 아이템번호가 아이템마스터에 있는지 체크
            if (await this.chkITMNO(TMP_ITMNO)) {
              alert('No Item - scan item is not in Item Master')
              this.refresh()
              return
            }
          } else if (a.slice(0, 2) === '7Q') {
            TMP_QTY = a.slice(2)
            TMP_QTY = Number(TMP_QTY)
            // Label QTY 체크
            if (!TMP_QTY > 0) {
              alert('QTY Error - please check scan QTY is correct')
              this.refresh()
              return
            }
          } else if (a.slice(0, 1) === 'D') {
            TMP_DATE = a.slice(1)
            // 날짜변환
            if (TMP_DATE.length === 6) {
              if (TMP_DATE.slice(0, 2) > 12) {
                TMP_DATE = '20' + TMP_DATE
              } else {
                TMP_DATE = '20' + TMP_DATE.slice(-2) + TMP_DATE.slice(0, 4)
              }
            }
          } else if (a.slice(0, 2) === '3S') {
            TMP_SERNO = a.slice(2)
            if (TMP_SERNO.slice(0, 4) === 'KMMG') {
              TMP_CUST = 'S1301'
            } else if (TMP_SERNO.slice(0, 4) === '1102') {
              TMP_CUST = 'S1300'
            }
          }
        }
        // 스캔데이터를 tempData에 저장
        tempData.TMP_DATE = TMP_DATE
        tempData.TMP_ITMNO = TMP_ITMNO
        tempData.TMP_QTY = TMP_QTY
        tempData.TMP_SERNO = TMP_SERNO
        tempData.TMP_CUST = TMP_CUST
        console.log('scandata parsing:', datas)
        console.log('scandata', tempData)
        let selectedData = this.data.filter((a) => a.ITMNO === TMP_ITMNO)
        console.log('list data', selectedData)
        // 스캔아이템 번호가 쉬핑오더 리스트에 있는지 체크
        if (selectedData.length === 0) {
          alert('Not in List - scan Item does not match with Shipping Order')
          this.refresh()
          return
        }
        // 리스트 데이터를 selectedData에 저장
        selectedData = selectedData[0]
        console.log(selectedData.ASN_NO)
        // this.goToProduct(
        //   selectedData.ITMNO,
        //   selectedData.CUST_CD,
        //   tempData.TMP_SERNO
        // )
        this.goToProduct(selectedData, tempData)
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
</script>

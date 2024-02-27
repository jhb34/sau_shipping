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
      3. PRODUCT SCAN
      <font-awesome-icon
        icon="fa-solid fa-rotate"
        class="float-end"
        style="height: 4vh"
        @click="refresh"
      />
      <font-awesome-icon
        icon="fa-solid fa-house"
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
          <span style="font-size: 2vh">{{ pinput.ITMNO }}</span>
        </div>
      </div>
      <div class="input-group mt-1">
        <span class="input-group-text col-3 text-center" style="font-size: 2vh"
          >Pallet No.</span
        >
        <div class="form-control">
          <span style="font-size: 2vh">{{ pinput.TMP_SERNO }}</span>
        </div>
      </div>
      <div class="input-group mt-2">
        <input
          type="text"
          placeholder="Scan Here"
          v-model="pscanValue"
          @input="change"
          class="form-control"
          @keyup.enter="pbarcodeChk"
          autofocus
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
            <tr v-for="a in pdata" :key="a">
              <td>{{ a.PART_LABEL }}</td>
              <td>{{ a.SCAN_DTTM }}</td>
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
      pscanValue: '',
      pbarcode: '',
      scanData: [],
      selectedData: [],
      pinput: {},
      pdata: []
    }
  },
  setup() {},
  created() {
    this.pinput = this.$route.query
  },
  mounted() {
    if (localStorage.getItem('reloaded')) {
      // The page was just reloaded. Clear the value from local storage
      // so that it will reload the next time this page is visited.
      localStorage.removeItem('reloaded')
    } else {
      // Set a flag so that we know not to reload the page twice.
      localStorage.setItem('reloaded', '1')
      location.reload()
    }
    this.getProductlist()
  },
  unmounted() {},
  methods: {
    change() {
      // const asciiValues = [];
      // for (let i = 0; i < this.scannerData.length; i++) {
      //   const charCode = this.scannerData.charCodeAt(i);
      //   asciiValues.push(charCode);
      // }
      for (let i = 0; i < this.pscanValue.length; i++) {
        const charCode = this.pscanValue.charCodeAt(i)
        if (charCode === 29) {
          this.pbarcode += '{GS}'
        } else if (charCode === 30) {
          this.pbarcode += '{RS}'
        } else if (charCode === 4) {
          this.pbarcode += '{EOT}'
        } else if (charCode === 13) {
          alert('13')
        } else if (charCode === 32) {
          alert('32')
        } else {
          this.pbarcode += String.fromCharCode(charCode)
        }
      }
    },
    barcodeClear() {
      this.pbarcode = ''
      this.pscanValue = ''
    },
    async getProductlist() {
      const today1 = this.getDate1(new Date())
      const today2 = this.getDate2(new Date())
      const today3 = this.getDate3(new Date())
      const r = await this.$post('/api/productscan/getproductlist', {
        params: this.pinput.TMP_SERNO
      })
      if (r === undefined) {
        alert('Error at chkprdno')
        return
      }
      console.log('getproductlist', r)
      if (r.data.recordset.length > 1) {
        await this.inserthist([
          {
            SAL_YMD: this.pinput.SAL_YMD,
            TRAILER_NO: this.pinput.TRAILER_NO,
            CUST_CD: this.pinput.CUST_CD,
            ASN_NO: this.pinput.ASN_NO
          },
          {
            TMP_ITMNO: this.pinput.TMP_ITMNO,
            TMP_SERNO: this.pinput.TMP_SERNO,
            TMP_QTY: this.pinput.TMP_QTY
          },
          today1,
          today2,
          1
        ])
        if (
          Number(this.pinput.ORD_QTY) >
          Number(this.pinput.SCAN_QTY) + Number(this.pinput.TMP_QTY)
        ) {
          await this.updateorder([
            {
              SAL_YMD: this.pinput.SAL_YMD,
              TRAILER_NO: this.pinput.TRAILER_NO,
              ITMNO: this.pinput.ITMNO
            },
            Number(this.pinput.SCAN_QTY) + Number(this.pinput.TMP_QTY),
            Number(this.pinput.SCAN_BOX) + 1,
            today3,
            1
          ])
        } else if (
          Number(this.pinput.ORD_QTY) ===
          Number(this.pinput.SCAN_QTY) + Number(this.pinput.TMP_QTY)
        ) {
          await this.updateorder([
            {
              SAL_YMD: this.pinput.SAL_YMD,
              TRAILER_NO: this.pinput.TRAILER_NO,
              ITMNO: this.pinput.ITMNO
            },
            Number(this.pinput.SCAN_QTY) + Number(this.pinput.TMP_QTY),
            Number(this.pinput.SCAN_BOX) + 1,
            today3,
            2
          ])
        }
        this.goToPalletscan()
      } else {
        this.pdata = r.data.recordset
      }
    },
    // async chkDup(a) {
    //   const r = await this.$post('/chkdup', { params: a })
    //   console.log('chkDup', r)
    //   if (r.data.recordset.length === 0) {
    //     console.log('fun', false)
    //     return false
    //   } else {
    //     console.log('fun', true)
    //     return true
    //   }
    // },
    // async chkPO(a) {
    //   const r = await this.$post('/chkpo', { params: a })
    //   console.log('chkPO', r)
    //   if (r.data.recordset.length === 0) {
    //     console.log('fun', false)
    //     return true
    //   } else {
    //     console.log('fun', true)
    //     return false
    //   }
    // },
    // async chkITMNO(a) {
    //   const r = await this.$post('/chkitmno', { params: a })
    //   console.log('chkITMNO', r)
    //   if (r.data.recordset.length === 0) {
    //     return true
    //   } else {
    //     return false
    //   }
    // },
    async chkALC(a) {
      const r = await this.$post('/api/productscan/chkalc', { params: a })
      if (r === undefined) {
        alert('Error at chkALC')
        return
      }
      console.log('chkALC', r)
      if (r.data.recordset.length === 0) {
        return true
      } else {
        return false
      }
    },
    async chkprdno(a) {
      const r = await this.$post('/api/productscan/chkprdno', { params: a })
      if (r === undefined) {
        alert('Error at chkprdno')
        return
      }
      console.log('chkprdno', r)
      if (r.data.recordset.length > 0) {
        return true
      } else {
        return false
      }
    },
    async inserthist(a) {
      const r = await this.$post('/api/inserthist', { params: a })
      if (r === undefined) {
        alert('Error at inserthist')
      }
      console.log('inserthist', r)
    },
    async insertproduct(a) {
      const r = await this.$post('/api/productscan/insertproduct', {
        params: a
      })
      if (r === undefined) {
        alert('Error at insertproduct')
      }
      console.log('insertproduct', r)
    },
    async updateorder(a) {
      const r = await this.$post('/api/updateorder', { params: a })
      if (r === undefined) {
        alert('Error at updateorder')
      }
      console.log('updateorder', r)
    },
    goToHome() {
      this.$router.push({
        path: '/'
      })
    },
    goToPalletscan() {
      this.$router.push({
        path: '/palletscan',
        query: {
          trail: this.pinput.TRAILER_NO,
          date: this.pinput.SAL_YMD,
          cust: this.pinput.CUST_CD
        }
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
    async pbarcodeChk() {
      let PRD_ITMNO = ''
      let PRD_ALC = ''
      let PRD_NO = ''
      let PALLET_ITMNO = ''
      const scanValue = this.pbarcode.toUpperCase()
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
            PALLET_ITMNO = this.pinput.TMP_ITMNO.replace('-', '')
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
            let prdno = this.pinput.TMP_ITMNO
            if (this.pinput.TMP_CUST === 'S1301') {
              prdno = this.pinput.TMP_ITMNO + 'K'
            }
            // product ALC 체크
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
          this.pinput.TMP_SERNO,
          productNO,
          PALLET_ITMNO,
          PRD_ITMNO,
          today2
        ])
        this.refresh()
      } else {
        alert('Label Error - please check product label')
        console.log('no', this.pscanValue.slice(0, 7))
        location.reload()
      }
    }
  }
}
</script>

<template>
  <div @drop="_drop" @dragenter="_suppress" @dragover="_suppress" class="container">
    <div class="row"><div class="col-xs-12">
      <form class="form-inline">
        <div class="form-group">
          <label for="file">Выберите Excel/LibreOffice файл</label>
          <input type="file" class="form-control" id="file" :accept="SheetJSFT" @change="_change" />
        </div>
      </form>
    </div></div>
    <div class="row"><div class="col-xs-12">
      <div class="table-responsive">
        <table class="table table-striped">
          <thead><tr>
            <th v-for="c in cols" :key="c">{{columnNames[c]}}</th>
          </tr></thead>
          <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td v-for="column in cols" :key="column"> {{ item[column] }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div></div>
  </div>
</template>

<script>
import parse_file from '../rosneft'


const _SheetJSFT = [
  "xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
].map(function(x) { return "." + x; }).join(",");

export default {
  name: "XlxReader",
  data() {
    return {
      data: [],
      cols: [],
      columnNames: {
        'card': "Номер карты"
        ,'location': "Место заправки"
        ,'date': "Дата"
        ,'fuelType': "Тип топлива"
        ,'volume': "Объем"
      },
      SheetJSFT: _SheetJSFT
    }; },
  methods: {
    _suppress(evt) { evt.stopPropagation(); evt.preventDefault(); },
    _drop(evt) {
      evt.stopPropagation(); evt.preventDefault();
      const files = evt.dataTransfer.files;
      if(files && files[0]) this._file(files[0]);
    },
    _change(evt) {
      const files = evt.target.files;
      if(files && files[0]) this._file(files[0]);
    },
    _file(file) {
      /* Boilerplate to set up FileReader */
      const reader = new FileReader();
      reader.onload = (e) => {
        /* Parse data */
        this.data = parse_file(e.target.result);
        this.cols = ['card', 'location', 'date', 'fuelType', 'volume'];
      };
      reader.readAsBinaryString(file);
    }
  }
};
</script>
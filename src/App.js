import React, { useState, useCallback } from "react";
import "react-datepicker/dist/react-datepicker.css";
import './App.css';
import Grid from '@mui/material/Grid';
import Item from '@mui/material/Grid';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from "@mui/x-date-pickers";
import { TextField } from "@mui/material";
import { Button } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

const columns = [
  { id: 'transferDate', label: 'Dados', minWidth: 170 },
  { id: 'value', label: 'Valentia', minWidth: 100 },
  { id: 'type', label: 'Tipo', minWidth: 100 },
  { id: 'transactionOperatorName', label: 'Nome operador transactionado', minWidth: 100 },
];

function transform(column, value) {
  if (column.id === 'value') {
    return "R$ " + value
  }

  if (column.id === 'transferDate') {
    return value.substring(0, 10).replaceAll('-', '/')
  }

  if (!value) {
    return ''
  }

  return value
}

function App() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [operator, setOperator] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0.00)
  const [period, setPeriod] = useState(0.00)

  const dateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ'

  const sendRequest = useCallback(async () => {
    var requestUrl = 'http://localhost:8080/transfer?'

    if (startDate) {
      requestUrl += "startDate=" + encodeURIComponent(startDate.format(dateFormat)) + "&"
    }

    if (endDate) {
      requestUrl += "endDate=" + encodeURIComponent(endDate.format(dateFormat)) + "&"
    }

    if (operator) {
      requestUrl += "operator=" + operator
    }

    console.log(requestUrl)

    fetch('http://localhost:8080/transfer')
    .then((response) => response.json())
    .then((data) => {
      setTotal(data
        .slice(0, data.length)
        .map((row) => row.value)
        .reduce((a, b) => a + b, 0));
    })
    .catch((err) => {
      console.log(err.message);
    });

    fetch(requestUrl)
    .then((response) => response.json())
    .then((data) => {
      setPeriod(data
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row) => row.value)
        .reduce((a, b) => a + b, 0));

      setRows(data);
    })
    .catch((err) => {
      console.log(err.message);
    });
  }, [startDate, endDate, operator, page, rowsPerPage])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 5));
    setPage(0);
  };

  return (
    <div className="App">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={2}>
          <Grid item>
            <Item>
              <label>Data de Início</label>
              <DateTimePicker
                value={startDate}
                onChange={(date) => setStartDate(date)}/>

            </Item>
          </Grid>
          <Grid item>
            <Item>
              <label>Data de Fim</label>
              <DateTimePicker
                value={endDate}
                onChange={(date) => setEndDate(date)}/>
            </Item>
          </Grid>
          <Grid item>
            <Item>
              <label>Nome Operador Transactionado</label>
              <TextField
                style={{width: 300}}
                id="operator"
                value={operator}
                onChange={(event) => {
                  setOperator(event.target.value)
                }}/>
            </Item>
          </Grid>
        </Grid>

        <Grid item>
          <Item>
            <Button variant="outlined" onClick={sendRequest}>Pesquisar</Button>
          </Item>
        </Grid>

        <Grid item>
            <Item>

              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" colSpan={2}>
                        Saldo total: R$ {parseFloat(total).toFixed(2).toLocaleString("pt-BR").replace(".", ",")}
                      </TableCell>
                      <TableCell align="center" colSpan={3}>
                        Saldo no período: R$ {parseFloat(period).toFixed(2).toLocaleString("pt-BR").replace(".", ",")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ top: 57, minWidth: column.minWidth }}>

                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => {
                        return (
                          <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                            {columns.map((column) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={column.id} align={column.align}>
                                    { transform(column, value) }
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />

            </Item>
          </Grid>
      </LocalizationProvider>
    </div>
  );
}

export default App;

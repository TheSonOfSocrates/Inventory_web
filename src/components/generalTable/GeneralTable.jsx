import React from "react";
import { useRef, useState, useEffect } from "react";
import { Row, Table, Input, Button, Upload } from "antd";
import * as XLSX from "xlsx";
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined, ReloadOutlined, PrinterOutlined, DownloadOutlined } from "@ant-design/icons";

import { useReactToPrint } from "react-to-print";

const { Search } = Input;

const GeneralTable = (props) => {
  const tableRef = useRef();

  const {
    columns,
    data,
    onSearch,
    onRefresh,
    isPrint = true,
    isDownloadExcel = true,
    paperSize = "A4",
    paperLayout = "landscape",
    processDataForExcel = (e) => e,
    onUpload,
    onOpenFilterModel,
    ...restProps
  } = props;

  const onPrint = useReactToPrint({
    content: () => tableRef.current,
    pageStyle: `
      @page {
        size: ${paperSize} ${paperLayout}; /* Set paper size and orientation (landscape) */
        margin: 20mm; /* Set margins */
      }
      body {
        background-color: white;
        margin: 0px;
      }
      .action-column, .ant-table-thead th:nth-child(2){
        display: none; /* Hide the action column when printing */
      }
    `,
  });

  const exportToExcel = () => {
    const processedData = processDataForExcel(data);
    console.log("processed Data for Excel ", processedData);
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "data.xlsx");
  };

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data

  const handleChange = (e) => {
    if (e.target.value?.length === 0) {
      onSearch(e.target.value);
    }
  };

  return (
    <div>
      <Row
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <div className="search-wrapper rightItem">
          {onSearch && (
            <label htmlFor="search-form">
              <Search
                placeholder="What are you looking for?"
                allowClear
                onSearch={onSearch}
                onChange={handleChange}
                enterButton
                style={{ width: "400px" }}
              />
            </label>
          )}
          {onOpenFilterModel && (
            <Button type="primary" shape="round" className="addMoreFilters" onClick={onOpenFilterModel}>
              + More filters
            </Button>
          )}
        </div>
        <div className="btn-group">
          {onRefresh && (
            <Button type="primary" shape="round" icon={<ReloadOutlined />} onClick={onRefresh}>
              Refresh
            </Button>
          )}
          {isPrint && (
            <Button type="primary" shape="round" icon={<PrinterOutlined />} onClick={onPrint}>
              Print
            </Button>
          )}
          {isDownloadExcel && (
            <Button type="primary" shape="round" icon={<DownloadOutlined />} onClick={exportToExcel}>
              Excel
            </Button>
          )}
          {onUpload && (
            <Upload name="file" accept=".xlsx,.csv" customRequest={onUpload} multiple={false}>
              <Button type="primary" shape="round" icon={<UploadOutlined />}>
                Upload
              </Button>
            </Upload>
          )}
        </div>
      </Row>
      <Table
        ref={tableRef}
        style={{ display: "flex", overflow: "scroll" }}
        dataSource={data.map((item, index) => ({
          ...item,
          key: index,
        }))}
        {...restProps}
        columns={columns}
        pagination={{
          position: ["bottomLeft"],
          current: currentPage,
          pageSize: pageSize,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: true,
          onShowSizeChange: (current, size) => setPageSize(size),
        }}
      />
    </div>
  );
};

export default GeneralTable;

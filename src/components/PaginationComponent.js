import React, { useState} from "react";
import { Pagination, Container } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PaginationComponent = ({ currentPage, setCurrentPage, totalPages, totalItems, pageSize, setPageSize }) => {

    const [inputValue, setInputValue] = useState(pageSize);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const renderPageNumbers = () => {
        let pages = [];

        pages.push(
            <Pagination.Item key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>
                1
            </Pagination.Item>
        );

        if (currentPage > 3) {
            pages.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
        }

        if (currentPage > 2) {
            pages.push(
                <Pagination.Item key={currentPage - 1} onClick={() => handlePageChange(currentPage - 1)}>
                    {currentPage - 1}
                </Pagination.Item>
            );
        }

        if (currentPage !== 1 && currentPage !== totalPages) {
            pages.push(
                <Pagination.Item key={currentPage} active>
                    {currentPage}
                </Pagination.Item>
            );
        }

        if (currentPage < totalPages - 1) {
            pages.push(
                <Pagination.Item key={currentPage + 1} onClick={() => handlePageChange(currentPage + 1)}>
                    {currentPage + 1}
                </Pagination.Item>
            );
        }

        if (currentPage < totalPages - 2) {
            pages.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
        }

        if (totalPages > 1) {
            pages.push(
                <Pagination.Item key={totalPages} active={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                </Pagination.Item>
            );
        }

        return pages;
    };

    return (
        <Container className="text-center mt-5">
            <div className="d-flex justify-content-center mt-3">
                <Pagination>
                    <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <FaChevronLeft />
                    </Pagination.Prev>

                    {renderPageNumbers()}

                    <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <FaChevronRight />
                    </Pagination.Next>
                </Pagination>
            </div>

            <div className="d-flex justify-content-center mb-3 align-items-center">
                <span>Resultados por página: </span>
                <input
                    type="number"
                    className="form-control mx-2"
                    style={{ width: "80px" }}
                    min="1"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={(e) => {
                        const validValue = Math.max(1, parseInt(inputValue, 10) || 1);
                        setPageSize(validValue);
                        setCurrentPage(1);
                        setInputValue(validValue);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.target.blur();
                        }
                    }}
                />
                <span>de {totalItems}</span>
            </div>
        </Container>
    );
};

export default PaginationComponent;
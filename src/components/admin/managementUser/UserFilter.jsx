import { Col, Row } from "reactstrap";

const UserFilter = (props) => {
    const { onSearch } = props
    return (
        <>
            <Row className="g-3">
                <Col sm={4}>
                    <div className="search-box">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name or email..."
                            onChange={(e) => onSearch(e.target.value)}
                        />
                        <i className="ri-search-line search-icon"></i>
                    </div>
                </Col>
            </Row>

        </>
    )
};

export default UserFilter;
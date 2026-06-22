const Loading = ({deviceName = "data"}) => {
    return (
       <div className="waiting">
          <div className="spinner" />
          <p>Waiting for data from {deviceName}</p>
        </div>
     );
}
export default Loading;
import PropTypes from 'prop-types'

const WorkoutDetails = ({ workout }) => {
    return (
        <div className="workout-details">
            <h4>{workout.title}</h4>
            <p><strong>Load (Kg): </strong>{workout.load}</p>
            <p><strong>Reps: </strong>{workout.load}</p>
            <p>{workout.createdAt}</p>
        </div>
      );
}

WorkoutDetails.propTypes = {
    workout: PropTypes.shape({
        title: PropTypes.string.isRequired,
        load: PropTypes.number.isRequired,
        reps: PropTypes.number.isRequired,
        createdAt: PropTypes.string.isRequired
    }).isRequired
};
 
export default WorkoutDetails;
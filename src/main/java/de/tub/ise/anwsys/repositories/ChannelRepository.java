package de.tub.ise.anwsys.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import de.tub.ise.anwsys.model.Channel;

public interface ChannelRepository extends PagingAndSortingRepository<Channel,Long> {

    Optional<Channel> findByChannelName(final String name);

    //Es werden alle User abgefragt die eine Nachricht an einem bestimmten Channel geschickt haben
    @Query("Select creator from Message where channel_id = :channelId group by creator")
    List<String> findUsersOfChannel(@Param("channelId") final long channelId);

}
